import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import Input from '../common/Input';
import Button from '../common/Button';
import { authApi } from '../../services/api/authApi';
import { setEmail, setStep } from '../../store/slices/authSlice';

const RequestOtpForm = () => {
  const [localEmail, setLocalEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!localEmail) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(localEmail)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.sendOtp(localEmail);
      toast.success('Mã xác thực đã được gửi đến email của bạn!');
      dispatch(setEmail(localEmail));
      dispatch(setStep(2));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Nhập địa chỉ email của bạn để nhận mã xác thực đặt lại mật khẩu.
        </p>
        <Input
          label="Địa chỉ Email"
          type="email"
          placeholder="mssv@student.hcmute.edu.vn"
          icon={Mail}
          value={localEmail}
          onChange={(e) => {
            setLocalEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
        />
      </div>

      <Button type="submit" isLoading={isLoading}>
        Gửi mã xác thực
      </Button>
    </form>
  );
};

export default RequestOtpForm;
