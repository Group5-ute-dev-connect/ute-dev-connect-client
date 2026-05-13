import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../store/authSlice";
import InputField from "../common/InputField";
import Button from "../common/Button";
import Alert from "../common/Alert";
import Spinner from "../common/Spinner";

const initialFormData = {
  name: "",
  email: "",
  studentId: "",
  password: "",
  confirmPassword: "",
};

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { registerLoading, registerSuccess, registerMessage, registerError } =
    useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});

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

    if (!formData.name.trim()) {
      errors.name = "Vui lòng nhập họ và tên.";
    }

    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập email.";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Email không đúng định dạng.";
    }

    if (!formData.studentId.trim()) {
      errors.studentId = "Vui lòng nhập mã số sinh viên.";
    }

    if (!formData.password) {
      errors.password = "Vui lòng nhập mật khẩu.";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Vui lòng xác nhận mật khẩu.";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Mật khẩu xác nhận không khớp.";
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) return;

    const resultAction = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(resultAction)) {
      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    }
  };

  return (
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
          U
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          Tạo tài khoản UTE Dev Connect
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Kết nối sinh viên HCMUTE đam mê lập trình.
        </p>
      </div>

      <div className="mb-5 space-y-3">
        <Alert
          type="success"
          message={registerSuccess ? registerMessage : ""}
        />
        <Alert type="error" message={registerError} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Họ và tên"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ví dụ: Huỳnh Ngọc Tài"
          error={formErrors.name}
          autoComplete="name"
        />

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
          label="Mã số sinh viên"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          placeholder="Ví dụ: 22110333"
          error={formErrors.studentId}
        />

        <InputField
          label="Mật khẩu"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Nhập mật khẩu"
          error={formErrors.password}
          autoComplete="new-password"
        />

        <InputField
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Nhập lại mật khẩu"
          error={formErrors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" disabled={registerLoading}>
          <span className="flex items-center justify-center gap-2">
            {registerLoading && <Spinner />}
            {registerLoading ? "Đang đăng ký..." : "Đăng ký"}
          </span>
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;