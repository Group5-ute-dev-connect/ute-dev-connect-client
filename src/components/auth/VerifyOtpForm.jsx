import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp } from "../../store/authSlice";
import InputField from "../common/InputField";
import Button from "../common/Button";
import Alert from "../common/Alert";
import Spinner from "../common/Spinner";

function VerifyOtpForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultEmail = location.state?.email || "";

  const { verifyOtpLoading, verifyOtpSuccess, verifyOtpMessage, verifyOtpError } =
    useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: defaultEmail,
    otp: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (verifyOtpSuccess) {
      const timerId = setTimeout(() => {
        navigate("/login");
      }, 1500);

      return () => clearTimeout(timerId);
    }
  }, [verifyOtpSuccess, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setFormErrors({
      ...formErrors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập email.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Email không đúng định dạng.";
    }

    if (!formData.otp.trim()) {
      errors.otp = "Vui lòng nhập mã OTP.";
    } else if (formData.otp.trim().length < 4) {
      errors.otp = "Mã OTP không hợp lệ.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    await dispatch(
      verifyOtp({
        email: formData.email,
        otp: formData.otp.trim(),
      })
    );
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
          OTP
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Xác thực tài khoản
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Nhập mã OTP đã được gửi đến email của bạn.
        </p>
      </div>

      <div className="mb-5 space-y-3">
        <Alert type="success" message={verifyOtpSuccess ? verifyOtpMessage : ""} />
        <Alert type="error" message={verifyOtpError} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Ví dụ: tai@student.hcmute.edu.vn"
          error={formErrors.email}
          autoComplete="email"
        />

        <InputField
          label="Mã OTP"
          name="otp"
          value={formData.otp}
          onChange={handleChange}
          placeholder="Nhập mã OTP"
          error={formErrors.otp}
        />

        <Button type="submit" disabled={verifyOtpLoading}>
          <span className="flex items-center justify-center gap-2">
            {verifyOtpLoading && <Spinner />}
            {verifyOtpLoading ? "Đang xác thực..." : "Xác thực OTP"}
          </span>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Chưa nhận được mã?{" "}
        <Link to="/register" className="font-semibold text-blue-600 hover:underline">
          Đăng ký lại
        </Link>
      </p>
    </div>
  );
}

export default VerifyOtpForm;