'use client';
import React, { useState } from "react";
import { Modal, Button } from "antd";
import Login from "../auth/login/page";
import Register from "../auth/register/page";

interface LoginRegisterModalProps {
  visible: boolean;
  onClose: () => void;
  setUserRole: (role: "user" | "business" | null) => void;
}

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({
  visible,
  onClose,
}) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      className="rounded-xl p-4"
    >
      {isLogin ? (
        <Login />
      ) : (
        <Register />
      )}

      <p className="mt-4 text-center text-gray-500">
        {isLogin ? "New here?" : "Already have an account?"}{" "}
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Register" : "Login"}
        </span>
      </p>
    </Modal>
  );
};

export default LoginRegisterModal;
