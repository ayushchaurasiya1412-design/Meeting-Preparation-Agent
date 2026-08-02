import { useEffect, useState } from "react";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

// ── helpers ──────────────────────────────────────────────────
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDayOf(y, m)  { return new Date(y, m, 1).getDay(); }

const STATUS_COLORS = {
  completed : { bg:"#ecfdf5", border:"#a7f3d0", text:"#059669", dot:"#10b981" },
  upcoming  : { bg:"#f5f3ff", border:"#ddd6fe", text:"#7c3aed", dot:"#7c3aed" },
  pending   : { bg:"#fffbeb", border:"#fde68a", text:"#d97706", dot:"#f59e0b" },
  cancelled : { bg:"#fff1f2", border:"#fecdd3", text:"#e11d48", dot:"#f43f5e" },
};
