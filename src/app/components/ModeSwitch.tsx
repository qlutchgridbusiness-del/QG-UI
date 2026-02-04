"use client";

import { useEffect, useState } from "react";
import { Dropdown, Menu, Button } from "antd";
import { SwapOutlined, ShopOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_BASE } from "@/app/lib/api";

export default function ModeSwitch() {
  const [mode, setMode] = useState<"USER" | "BUSINESS">("USER");
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    const savedMode = localStorage.getItem("activeMode") as any;
    if (savedMode) setMode(savedMode);

    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE}/business/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBusinesses(res.data || []);
    } catch {
      setBusinesses([]);
    }
  }

  function switchToUser() {
    localStorage.setItem("activeMode", "USER");
    localStorage.removeItem("activeBusinessId");
    setMode("USER");
    window.location.href = "/user-dashboard";
  }

  function switchToBusiness(business: any) {
    localStorage.setItem("activeMode", "BUSINESS");
    localStorage.setItem("activeBusinessId", business.id);
    setMode("BUSINESS");
    window.location.href = "/business-dashboard";
  }

  const menu = (
    <Menu>
      <Menu.Item
        icon={<UserOutlined />}
        onClick={switchToUser}
        disabled={mode === "USER"}
      >
        User Mode
      </Menu.Item>

      {businesses.map((b) => (
        <Menu.Item
          key={b.id}
          icon={<ShopOutlined />}
          onClick={() => switchToBusiness(b)}
        >
          {b.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomRight">
      <Button icon={<SwapOutlined />}>
        {mode === "USER" ? "User Mode" : "Business Mode"}
      </Button>
    </Dropdown>
  );
}
