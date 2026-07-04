"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LeaveDTO, LeaveStatus } from "@/types";

interface LeaveActionDialogProps {
  leave: LeaveDTO | null;
  action: Extract<LeaveStatus, "APPROVED" | "REJECTED"> | null;
  onClose: () => void;
  onSuccess: (updated: LeaveDTO) => void;
}

export function LeaveActionDialog({
  leave,
  action,
  onClose,
  onSuccess,
}: LeaveActionDialogProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = Boolean(leave && action);

  async function handleConfirm() {
    if (!leave || !action) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/leaves/${leave.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, hrComment: comment || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update leave request.");
      }

      const updated = await res.json();
      toast.success(
        action === "APPROVED" ? "Leave approved" : "Leave rejected",
        { description: `${leave.user?.name}'s request has been updated.` }
      );
      onSuccess(updated);
      setComment("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "APPROVED" ? "Approve" : "Reject"} Leave Request
          </DialogTitle>
          <DialogDescription>
            {leave?.user?.name} · {leave?.days} day(s) · {leave?.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="hrComment">Comment (optional)</Label>
          <Textarea
            id="hrComment"
            placeholder="Add a note for the employee..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={action === "APPROVED" ? "success" : "destructive"}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {action === "APPROVED" ? "Approve" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
