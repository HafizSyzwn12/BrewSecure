import { Button, Card, Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addUser } from "../../redux/rtk/features/user/userSlice";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { loadPermissionById } from "../../redux/rtk/features/auth/authSlice";
import { getSetting } from "../../redux/rtk/features/setting/settingSlice";
import LoginTable from "../Card/LoginTable";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data, loading } = useSelector((state) => state?.setting) || {};

  // Local states
  const [imageError, setImageError] = useState(false);
  const [loader, setLoader] = useState(false);
  const [defaultValue, setDefaultValue] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");

  // ✅ Handle initial login (username/password)
  const onFinish = async (values) => {
    try {
      setLoader(true);
      const resp = await dispatch(addUser(values));

      if (resp?.payload?.message === "2FA code sent to your email.") {
        // ✅ Require 2FA step
        setUserId(resp.payload.userId);
        setShow2FA(true);
        message.info("A verification code has been sent to your email.");
      } else if (resp?.payload?.token) {
        // ✅ If backend skips 2FA (for admin/test users)
        handleSuccessfulLogin(resp.payload);
      } else {
        message.error(resp?.payload?.error || "Invalid credentials");
      }
    } catch (err) {
      message.error("Login failed. Please try again.");
    } finally {
      setLoader(false);
    }
  };

  // ✅ Handle OTP verification
  const handle2FAVerification = async () => {
    try {
      if (!otp) return message.warning("Please enter your 2FA code.");
      setLoader(true);

      const res = await axios.post("/user/verify-2fa", { userId, otp });

      if (res.data?.token) {
        handleSuccessfulLogin(res.data);
      } else {
        message.error("Invalid verification code");
      }
    } catch (err) {
      message.error("Invalid or expired verification code");
    } finally {
      setLoader(false);
    }
  };

  // ✅ Common function to finalize login
  const handleSuccessfulLogin = (userData) => {
    localStorage.setItem("access-token", userData.token);
    localStorage.setItem("role", userData.role);
    localStorage.setItem("roleId", userData.roleId);
    localStorage.setItem("user", userData.username);
    localStorage.setItem("id", userData.id);
    localStorage.setItem("isLogged", "true");

    dispatch(getSetting());
    dispatch(loadPermissionById(userData.roleId));

    message.success("Login successful!");
    navigate("/admin");
  };

  const onFinishFailed = () => {
    setLoader(false);
  };

  // ✅ Auto-redirect if already logged in
  useEffect(() => {
    const isLogged = localStorage.getItem("isLogged") === "true";
    if (isLogged && !show2FA) {
      navigate("/admin");
    }
  }, [show2FA, navigate]);

  // ✅ Pre-fill demo credentials if enabled
  useEffect(() => {
    if (defaultValue && defaultValue.length > 0) {
      form.setFieldsValue({
        username: defaultValue[0]?.username || "",
        password: defaultValue[0]?.password || "",
      });
    }
  }, [defaultValue, form]);

  return (
    <div className="flex justify-center items-center h-screen">
      <Card bordered={false} className="w-full max-w-[24rem] mt-[30px] mx-auto">
        {/* Logo */}
        {data && !loading && (
          <div className="w-[180px] h-[70px] mx-auto flex items-center justify-center">
            {data?.logo && !imageError ? (
              <img
                className="text-white text-center mt-2 mb-1"
                alt="logo"
                src={data.logo}
                style={{ width: "180px", height: "70px" }}
                onError={() => setImageError(true)}
              />
            ) : (
              <h2 className="text-center flex items-center justify-center gap-2 text-[30px]">
                Brew
                <strong style={{ color: "#55F", fontWeight: "bold" }}>
                  Secure
                </strong>
              </h2>
            )}
          </div>
        )}

        {/* Skeleton loader */}
        {loading && (
          <div className="w-[180px] h-[70px] mx-auto flex flex-col gap-1">
            <h1 className="bg-slate-200 h-4 rounded w-full animate-pulse"></h1>
            <h1 className="bg-slate-200 h-4 rounded w-full animate-pulse"></h1>
            <h1 className="bg-slate-200 h-4 rounded w-full animate-pulse"></h1>
          </div>
        )}

        {/* Heading */}
        <h1 className="font-Popins font-semibold text-xl text-center mt-3 pb-4">
          Welcome Back
        </h1>

        {/* ✅ Login form OR 2FA input */}
        {!show2FA ? (
          <Form
            name="basic"
            onFinish={onFinish}
            form={form}
            initialValues={{
              username: defaultValue[0]?.username || "",
              password: defaultValue[0]?.password || "",
            }}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              className="mb-4"
              name="username"
              rules={[{ required: true, message: "Please input your username!" }]}
            >
              <Input
                prefix={<UserOutlined className="ml-1" />}
                placeholder="Enter username"
              />
            </Form.Item>

            <Form.Item
              className="mb-2"
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="ml-1" />}
                placeholder="Enter password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full rounded-md font-Popins"
                loading={loader}
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="mt-4">
            <h2 className="text-center font-semibold mb-3">Enter 2FA Code</h2>
            <Input
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button
              type="primary"
              className="w-full mt-3"
              onClick={handle2FAVerification}
              loading={loader}
            >
              Verify Code
            </Button>
          </div>
        )}

        {/* Demo login table */}
        {import.meta.env.VITE_DEMO_LOGIN === "true" && (
          <div className="py-4">
            <LoginTable setDefaultValue={setDefaultValue} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login;
