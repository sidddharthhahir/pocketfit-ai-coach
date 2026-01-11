import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Sparkles,
  Plus,
  Target,
  Trophy,
  Dumbbell,
  Heart,
  Brain,
  Star,
  Check,
  Trash2,
  Quote,
} from "lucide-react";

interface VisionBoardItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  is_achieved: boolean;
  achieved_at: string | null;
  created_at: string;
}

interface VisionBoardProps {
  userId: string;
}

const CATEGORIES = [
  { value: "fitness", label: "Fitness Goals", icon: Dumbbell, color: "text-primary" },
  { value: "health", label: "Health & Wellness", icon: Heart, color: "text-red-500" },
  { value: "mindset", label: "Mindset & Growth", icon: Brain, color: "text-purple-500" },
  { value: "achievement", label: "Achievements", icon: Trophy, color: "text-yellow-500" },
  { value: "quote", label: "Motivational Quotes", icon: Quote, color: "text-blue-500" },
];

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", // Gym
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", // Running
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop", // Weights
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop", // Healthy food
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop", // Yoga
  "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=400&h=300&fit=crop", // Meditation
];

export const VisionBoard = ({ userId }: VisionBoardProps) => {
  const [items, setItems] = useState<VisionBoardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "fitness",
  });

  useEffect(() => {
    loadItems();
  }, [userId]);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from("vision_board_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error loading vision board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      const { error } = await supabase.from("vision_board_items").insert({
        user_id: userId,
        title: newItem.title,
        description: newItem.description || null,
        image_url: newItem.image_url || null,
        category: newItem.category,
      });

      if (error) throw error;

      toast.success("Vision added to your board! ✨");
      setNewItem({ title: "", description: "", image_url: "", category: "fitness" });
      setIsDialogOpen(false);
      loadItems();
    } catch (error) {
      console.error("Error adding vision item:", error);
      toast.error("Failed to add vision");
    }
  };

  const toggleAchieved = async (item: VisionBoardItem) => {
    try {
      const { error } = await supabase
        .from("vision_board_items")
        .update({
          is_achieved: !item.is_achieved,
          achieved_at: !item.is_achieved ? new Date().toISOString() : null,
        })
        .eq("id", item.id);

      if (error) throw error;

      if (!item.is_achieved) {
        toast.success("🎉 Congratulations on achieving your goal!");
      }
      loadItems();
    } catch (error) {
      console.error("Error updating vision item:", error);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("vision_board_items").delete().eq("id", id);
      if (error) throw error;
      toast.success("Vision removed");
      loadItems();
    } catch (error) {
      console.error("Error deleting vision item:", error);
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    if (!cat) return Target;
    return cat.icon;
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat?.color || "text-muted-foreground";
  };

  const achievedCount = items.filter((i) => i.is_achieved).length;

  return (
    <Card className="p-6 border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Vision Board</h3>
            <p className="text-sm text-muted-foreground">
              Manifest your fitness goals
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vision
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Add to Vision Board
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input
                  placeholder="e.g., Run a marathon, Lose 10kg..."
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea
                  placeholder="Why is this important to you?"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <span className="flex items-center gap-2">
                          <cat.icon className={`w-4 h-4 ${cat.color}`} />
                          {cat.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Image (optional)
                </label>
                <Input
                  placeholder="Paste image URL or select below"
                  value={newItem.image_url}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {PRESET_IMAGES.map((url) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setNewItem({ ...newItem, image_url: url })}
                      className={`relative rounded-lg overflow-hidden h-16 border-2 transition-all ${
                        newItem.image_url === url
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Add to Vision Board
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div className="flex items-center gap-4 mb-6 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm">
              <strong>{items.length}</strong> visions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              <strong>{achievedCount}</strong> achieved
            </span>
          </div>
          {items.length > 0 && (
            <div className="ml-auto">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {Math.round((achievedCount / items.length) * 100)}% complete
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Vision Board Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500/50" />
          <p className="text-lg font-medium mb-2">Start Your Vision Board</p>
          <p className="text-muted-foreground mb-4">
            Add your fitness goals, dreams, and motivational quotes
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Vision
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const Icon = getCategoryIcon(item.category);
            return (
              <div
                key={item.id}
                className={`group relative rounded-xl overflow-hidden border transition-all hover:shadow-lg ${
                  item.is_achieved
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-border bg-card"
                }`}
              >
                {item.image_url && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className={`w-full h-full object-cover transition-all ${
                        item.is_achieved ? "grayscale-0" : "grayscale-[30%] group-hover:grayscale-0"
                      }`}
                    />
                    {item.is_achieved && (
                      <div className="absolute top-2 right-2 p-1.5 rounded-full bg-green-500">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${getCategoryColor(item.category)}`} />
                      <h4
                        className={`font-semibold ${
                          item.is_achieved ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={item.is_achieved ? "secondary" : "default"}
                      onClick={() => toggleAchieved(item)}
                      className="flex-1 text-xs"
                    >
                      {item.is_achieved ? (
                        <>
                          <Trophy className="w-3 h-3 mr-1" /> Achieved
                        </>
                      ) : (
                        <>
                          <Target className="w-3 h-3 mr-1" /> Mark Complete
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
