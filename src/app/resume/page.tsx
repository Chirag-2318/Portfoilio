"use client";
import { useEffect } from "react";
export default function ResumePage() {
  useEffect(() => { window.location.replace("/#overview"); }, []);
  return null;
}
