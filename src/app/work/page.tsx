"use client";
import { useEffect } from "react";
export default function WorkPage() {
  useEffect(() => { window.location.replace("/#projects"); }, []);
  return null;
}
