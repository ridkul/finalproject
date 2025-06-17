import api from './api';

export const getServices = (category, location) => {
    return api.get('/services', { params: { category, location } });
};

export const getService = (id) => {
    return api.get(`/services/${id}`);
};

export const getMyServices = () => {
    return api.get('/services/my-services');
};

export const createService = (service) => {
    return api.post('/services', service);
};

export const updateService = (id, service) => {
    return api.put(`/services/${id}`, service);
};

export const deleteService = (id) => {
    return api.delete(`/services/${id}`);
};