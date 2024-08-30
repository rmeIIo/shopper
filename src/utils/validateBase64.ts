export const validateBase64 = (data: string): boolean => {
  const base64Pattern = /^data:image\/(png|jpg|jpeg);base64,[A-Za-z0-9+/=]+$/;

  return base64Pattern.test(data);
}