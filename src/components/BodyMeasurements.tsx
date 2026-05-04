import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { Ruler, Plus, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { toast } from "sonner";

interface Props {
  userId: string;
}

const FIELDS: { key: keyof FormState; label: string }[] = [
  { key: "waist_cm", label: "Waist" },
  { key: "chest_cm", label: "Chest" },
  { key: "hips_cm", label: "Hips" },
  { key: "left_arm_cm", label: "Left arm" },
  { key: "right_arm_cm", label: "Right arm" },
  { key: "left_thigh_cm", label: "Left thigh" },
  { key: "right_thigh_cm", label: "Right thigh" },
  { key: "neck_cm", label: "Neck" },
];

type FormState = {
  waist_cm: string;
  chest_cm: string;
  hips_cm: string;
  left_arm_cm: string;
  right_arm_cm: string;
  left_thigh_cm: string;
  right_thigh_cm: string;
  neck_cm: string;
};

const empty: FormState = {
  waist_cm: "", chest_cm: "", hips_cm: "",
  left_arm_cm: "", right_arm_cm: "",
  left_thigh_cm: "", right_thigh_cm: "", neck_cm: "",
};

export const BodyMeasurements = ({ userId }: Props) => {
  const { data, loading, add, remove } = useBodyMeasurements(userId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const hasAny = Object.values(form).some((v) => v.trim() !== "");
    if (!hasAny) {
      toast.error("Enter at least one measurement");
      return;
    }
    setSaving(true);
    const payload = {
      log_date: new Date().toISOString().slice(0, 10),
      notes: null,
      ...Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v ? Number(v) : null])
      ),
    } as Parameters<typeof add>[0];
    const err = await add(payload);
    setSaving(false);
    if (err) {
      toast.error("Could not save");
    } else {
      toast.success("Measurements saved");
      setForm(empty);
      setOpen(false);
    }
  };

  const latest = data[0];
  const previous = data[1];

  const diff = (k: keyof FormState) => {
    if (!latest || !previous) return null;
    const a = latest[k as keyof BodyMeasurement] as number | null;
    const b = previous[k as keyof BodyMeasurement] as number | null;
    if (a == null || b == null) return null;
    return Number((a - b).toFixed(1));
  };

  return (
    <Card className="p-5 space-y-4 glass-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ruler className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Body measurements</h3>
        </div>
        <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
          <Plus className="w-4 h-4 mr-1" /> Log
        </Button>
      </div>

      {open && (
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <Label className="text-xs">{f.label} (cm)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={form[f.key]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [f.key]: e.target.value }))
                }
                placeholder="—"
              />
            </div>
          ))}
          <div className="col-span-2 flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              Save
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !latest ? (
        <EmptyState
          icon={Ruler}
          title="No measurements yet"
          description="Track waist, chest, arms and more — much more accurate than weight alone."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {FIELDS.map((f) => {
              const v = latest[f.key as keyof BodyMeasurement] as number | null;
              const d = diff(f.key);
              if (v == null) return null;
              return (
                <div key={f.key} className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground">{f.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-semibold">{v}</span>
                    <span className="text-xs text-muted-foreground">cm</span>
                  </div>
                  {d !== null && d !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        d < 0 ? "text-emerald-500" : "text-amber-500"
                      }`}
                    >
                      {d < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : (
                        <TrendingUp className="w-3 h-3" />
                      )}
                      {d > 0 ? "+" : ""}
                      {d} cm
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-semibold">History</p>
            {data.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/30"
              >
                <span>{new Date(r.log_date).toLocaleDateString()}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => remove(r.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};
