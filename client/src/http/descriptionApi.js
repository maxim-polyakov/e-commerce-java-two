import { $authhost } from '.'; // Используем правильное имя

export const getDescriptionByProductId = async (productId) => {
    const { data } = await $authhost.get(`/description/product/${productId}`); // Используем $authhost
    return data;
};

export const getDescriptionById = async (descriptionId) => {
    const { data } = await $authhost.get(`/description/${descriptionId}`);
    return data;
};

export const createDescription = async (productId, descriptionData) => {
    const { data } = await $authhost.post(`/description/product/${productId}`, descriptionData);
    return data;
};

export const updateDescription = async (descriptionId, descriptionData) => {
    const { data } = await $authhost.put(`/description/${descriptionId}`, descriptionData);
    return data;
};

export const updateDescriptionByProductId = async (productId, descriptionData) => {
    const { data } = await $authhost.put(`/description/product/${productId}`, descriptionData);
    return data;
};

export const deleteDescription = async (descriptionId) => {
    await $authhost.delete(`/description/${descriptionId}`);
};

export const deleteDescriptionByProductId = async (productId) => {
    await $authhost.delete(`/description/product/${productId}`);
};

export const checkDescriptionExists = async (productId) => {
    const { data } = await $authhost.get(`/description/product/${productId}/exists`);
    return data;
};

export const getDescriptionByArticleSku = async (articleSku) => {
    const { data } = await $authhost.get(`/description/sku/${articleSku}`);
    return data;
};

export const createOrUpdateDescription = async (productId, descriptionData) => {
    const { data } = await $authhost.patch(`/description/product/${productId}`, descriptionData);
    return data;
};