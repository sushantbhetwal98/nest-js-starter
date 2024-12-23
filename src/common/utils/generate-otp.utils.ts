export const generateOTP = () => {
  const numbers = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    otp += numbers[randomIndex];
  }
  return otp;
};
