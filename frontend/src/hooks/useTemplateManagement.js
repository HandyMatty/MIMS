import { useState, useEffect } from 'react';
import { Form, App } from 'antd';
import { getTemplates, deleteTemplate, updateTemplate } from '../services/api/saveTemplate';
import dayjs from 'dayjs';
import { itemTemplates } from '../components/Inventory/AddItemTypeTemplate';
import { useActivity } from '../utils/ActivityContext';
import { useNotification } from '../utils/NotificationContext';
import { useAdminAuthStore } from '../store/admin/useAuth';
import { useUserAuthStore } from '../store/user/useAuth';

const useTemplateManagement = (onTemplateSelect) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [userTemplates, setUserTemplates] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { logUserActivity } = useActivity();
  const { logUserNotification } = useNotification();
  const adminAuth = useAdminAuthStore();
  const userAuth = useUserAuthStore();

  useEffect(() => {
    loadTemplates();
  }, [refreshTrigger]);

  const loadTemplates = async () => {
    try {
      const response = await getTemplates();
      if (response.success) {
        setUserTemplates(response.templates);
        // Reset selection if needed
        if (selectedCategory === 'User Templates') {
          setSelectedCategory(null);
          setSelectedType(null);
          onTemplateSelect(null);
        }
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Error loading templates');
    }
  };

  const handleCategoryChange = (category) => {
    if (category === 'No Template' || !category) {
      setSelectedCategory(null);
      setSelectedType(null);
      onTemplateSelect(null);
      return;
    }
    setSelectedCategory(category);
    setSelectedType(null);
  };

  const handleTypeChange = (type) => {
    if (!type || type === 'No Template') {
      setSelectedCategory(null);
      setSelectedType(null);
      onTemplateSelect(null);
      return { isUserTemplate: false };
    }

    setSelectedType(type);

    if (selectedCategory === 'User Templates') {
      const template = userTemplates.find(t => t.template_name === type);
      if (template) {
        const formattedTemplate = {
          ...template,
          locationType: template.location.includes('Head Office') ? 'Head Office' : 'Other',
          department: template.location.includes('Head Office') 
            ? template.location.split(' - ')[1] 
            : null,
          location: template.location.includes('Head Office') 
            ? template.location 
            : template.location
        };
        onTemplateSelect(formattedTemplate);
        return { isUserTemplate: true };
      }
    } else if (selectedCategory && itemTemplates[selectedCategory][type]) {
      onTemplateSelect(itemTemplates[selectedCategory][type]);
      return { isUserTemplate: false };
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      ...template,
      locationType: template.location.includes('Head Office') ? 'Head Office' : 'Other',
      department: template.location.includes('Head Office') 
        ? template.location.split(' - ')[1] 
        : null,
      location: template.location.includes('Head Office') 
        ? null 
        : template.location,
      purchaseDate: template.purchaseDate ? dayjs(template.purchaseDate) : undefined,
      issuedDate: template.issuedDate ? dayjs(template.issuedDate) : undefined
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = async (template) => {
    try {
      const response = await deleteTemplate(template.id);
      if (response.success) {
        message.success('Template deleted successfully');
        setUserTemplates(prev => prev.filter(t => t.id !== template.id));
        if (selectedType === template.template_name) {
          setSelectedCategory(null);
          setSelectedType(null);
          onTemplateSelect(null);
        }
        setRefreshTrigger(prev => prev + 1);

        await logUserActivity(
          adminAuth.userData.username,
          'Template Deleted',
          `Template "${template.template_name}" has been deleted.`
        );

        await logUserNotification(
          'Template Deleted',
          `Template "${template.template_name}" has been deleted.`
        );
      } else {
        message.error(response.message || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('Error deleting template');
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        location: values.locationType === 'Head Office' 
          ? `Head Office - ${values.department}`
          : values.location,
        purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : null,
        issuedDate: values.issuedDate ? values.issuedDate.format('YYYY-MM-DD') : null
      };

      delete formattedValues.locationType;
      delete formattedValues.department;

      const response = await updateTemplate(editingTemplate.id, formattedValues);
      if (response.success) {
        message.success('Template updated successfully');
        setIsEditModalVisible(false);
        setUserTemplates(prev => prev.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, ...formattedValues }
            : t
        ));
        if (selectedType === editingTemplate.template_name) {
          const updatedTemplate = {
            ...editingTemplate,
            ...formattedValues,
            locationType: formattedValues.location.includes('Head Office') ? 'Head Office' : 'Other',
            department: formattedValues.location.includes('Head Office') 
              ? formattedValues.location.split(' - ')[1] 
              : null
          };
          onTemplateSelect(updatedTemplate);
        }
        setRefreshTrigger(prev => prev + 1);

        await logUserActivity(
          adminAuth.userData.username,
          'Template Updated',
          `Template "${values.template_name}" has been updated.`
        );

        await logUserNotification(
          'Template Updated',
          `Template "${values.template_name}" has been updated.`
        );
      } else {
        message.error(response.message || 'Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      message.error('Error updating template');
    }
  };

  const getCurrentUser = () => {
    if (adminAuth.token && adminAuth.userData) return adminAuth.userData;
    if (userAuth.token && userAuth.userData) return userAuth.userData;
    return null;
  };

  return {
    selectedCategory,
    selectedType,
    userTemplates,
    isEditModalVisible,
    editingTemplate,
    form,
    refreshTrigger,
    setRefreshTrigger,
    handleCategoryChange,
    handleTypeChange,
    handleEdit,
    handleDelete,
    handleEditSubmit,
    setIsEditModalVisible,
    getCurrentUser
  };
};

export default useTemplateManagement; 