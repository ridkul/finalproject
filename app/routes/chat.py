import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Message, User
from app.auth import get_current_user_ws
from app.websocket_manager import ConnectionManager
from datetime import datetime
from fastapi import Depends, HTTPException, status
from app.schemas import Message as MessageSchema

router = APIRouter()
manager = ConnectionManager()

@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    db: Session = Depends(get_db)
):
    # Authenticate user
    user = get_current_user_ws(token, db)
    if not user:
        await websocket.close()
        return
    
    # Add connection to manager
    await manager.connect(websocket, user.id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Save message to database
            new_message = Message(
                sender_id=user.id,
                receiver_id=message_data["receiver_id"],
                content=message_data["content"],
                timestamp=datetime.utcnow()
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)
            
            # Send message to receiver if online
            await manager.send_personal_message(
                json.dumps({
                    "sender_id": user.id,
                    "sender_name": user.name,
                    "content": message_data["content"],
                    "timestamp": new_message.timestamp.isoformat()
                }),
                message_data["receiver_id"]
            )
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user.id)
        


@router.get("/history/{other_user_id}", response_model=list[MessageSchema])
def get_message_history(
    other_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    messages = db.query(Message).filter(
        ((Message.sender_id == current_user.id) & (Message.receiver_id == other_user_id)) |
        ((Message.sender_id == other_user_id) & (Message.receiver_id == current_user.id))
    ).order_by(Message.timestamp.asc()).all()
    
    # Mark messages as read
    for message in messages:
        if message.receiver_id == current_user.id and not message.read:
            message.read = True
    db.commit()
    
    return messages