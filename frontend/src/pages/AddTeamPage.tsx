import React from "react";
import TeamForm from "../components/teams/TeamForm";
import { Link } from "@tanstack/react-router";

const AddTeamPage: React.FC = () => {
  return (
    <>
      <Link to="/">กลับสู่หน้าหลัก</Link>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-card-foreground mb-6">
            เพิ่มชื่อทีมใหม่
          </h2>
          <TeamForm />
        </div>
      </div>
    </>
  );
};

export default AddTeamPage;
