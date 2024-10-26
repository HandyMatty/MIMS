import { axiosAuth } from '../axios'; 

export const uploadAvatar = async (formData) => {
    try {
        const response = await axiosAuth.post('/upload.php', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${formData.get('token')}`, // Token passed in formData
            }
        });        
        return response.data;
    } catch (error) {
        throw new Error('Failed to upload avatar: ' + error.message);
    }
};
