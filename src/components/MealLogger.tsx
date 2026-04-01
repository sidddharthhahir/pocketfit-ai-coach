import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Utensils, Loader2, Plus, Trash2, Camera, X, Image, Pencil } from "lucide-react";
import { toast } from "sonner";
import { mealDescriptionSchema } from "@/lib/validationSchemas";
import { Progress } from "@/components/ui/progress";

interface MealItem {
  name: string;
  estimated_cal: number;
  estimated_protein_g: number;
}

interface MealLog {
  id: string;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  items: MealItem[];
  created_at: string;
}

type LogMode = 'text' | 'photo';

export const MealLogger = () => {
  const [mode, setMode] = useState<LogMode>('text');
  const [mealDescription, setMealDescription] = useState("");
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");
  const [isLoading, setIsLoading] = useState(false);
  const [todayMeals, setTodayMeals] = useState<MealLog[]>([]);
  const [isLoadingMeals, setIsLoadingMeals] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit state
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [editItems, setEditItems] = useState<MealItem[]>([]);
  const [editMealType, setEditMealType] = useState<string>("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    loadTodayMeals();
    loadNutritionGoals();
  }, []);

  const loadNutritionGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('fitness_plans')
        .select('target_calories, target_protein')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        setCalorieGoal(data.target_calories || 2000);
        setProteinGoal(data.target_protein || 150);
      }
    } catch (error) {
      console.error('Error loading nutrition goals:', error);
    }
  };

  const loadTodayMeals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTodayMeals((data || []) as unknown as MealLog[]);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setIsLoadingMeals(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogMealText = async () => {
    setValidationError(null);

    const result = mealDescriptionSchema.safeParse({
      mealDescription: mealDescription.trim(),
      mealType
    });

    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message || "Invalid input";
      setValidationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-meal', {
        body: {
          mealDescription: result.data.mealDescription,
          mealType: result.data.mealType
        }
      });

      if (error) throw error;

      setMealDescription("");
      toast.success("Meal logged successfully!");
      loadTodayMeals();
    } catch (error: any) {
      console.error('Error logging meal:', error);
      toast.error(error.message || 'Failed to log meal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogMealPhoto = async () => {
    if (!selectedImage || !imagePreview) {
      toast.error('Please select a photo first');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/${Date.now()}-${selectedImage.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, selectedImage);

      if (uploadError) throw uploadError;

      const { data: signedUrlData } = await supabase.storage
        .from('meal-photos')
        .createSignedUrl(fileName, 300);

      if (!signedUrlData?.signedUrl) {
        throw new Error('Failed to get image URL');
      }

      const { data, error } = await supabase.functions.invoke('analyze-meal-photo', {
        body: {
          imageUrl: signedUrlData.signedUrl,
          mealType
        }
      });

      if (error) throw error;

      clearImage();
      toast.success(`Detected: ${data.meal?.description || 'Food items logged!'}`);
      loadTodayMeals();
    } catch (error: any) {
      console.error('Error logging photo meal:', error);
      toast.error(error.message || 'Failed to analyze photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
      toast.success("Meal deleted");
      loadTodayMeals();
    } catch (error: any) {
      toast.error('Failed to delete meal');
    }
  };

  // Edit handlers
  const openEditDialog = (meal: MealLog) => {
    setEditingMeal(meal);
    setEditItems([...meal.items]);
    setEditMealType(meal.meal_type);
  };

  const updateEditItem = (index: number, field: keyof MealItem, value: string | number) => {
    const updated = [...editItems];
    if (field === 'name') {
      updated[index] = { ...updated[index], name: value as string };
    } else if (field === 'estimated_cal') {
      updated[index] = { ...updated[index], estimated_cal: Number(value) || 0 };
    } else if (field === 'estimated_protein_g') {
      updated[index] = { ...updated[index], estimated_protein_g: Number(value) || 0 };
    }
    setEditItems(updated);
  };

  const removeEditItem = (index: number) => {
    if (editItems.length <= 1) {
      toast.error("A meal must have at least one item");
      return;
    }
    setEditItems(editItems.filter((_, i) => i !== index));
  };

  const addEditItem = () => {
    setEditItems([...editItems, { name: "", estimated_cal: 0, estimated_protein_g: 0 }]);
  };

  const saveEdit = async () => {
    if (!editingMeal) return;
    
    const validItems = editItems.filter(item => item.name.trim().length > 0);
    if (validItems.length === 0) {
      toast.error("Add at least one item with a name");
      return;
    }

    setIsSavingEdit(true);
    try {
      const totalCalories = validItems.reduce((sum, item) => sum + item.estimated_cal, 0);
      const totalProtein = validItems.reduce((sum, item) => sum + item.estimated_protein_g, 0);

      const { error } = await supabase
        .from('meal_logs')
        .update({
          meal_type: editMealType,
          items: validItems as any,
          total_calories: totalCalories,
          total_protein: totalProtein,
        })
        .eq('id', editingMeal.id);

      if (error) throw error;

      toast.success("Meal updated");
      setEditingMeal(null);
      loadTodayMeals();
    } catch (error: any) {
      toast.error("Failed to update meal");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.total_calories, 0);
  const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.total_protein, 0);
  const calorieProgress = Math.min((totalCalories / calorieGoal) * 100, 100);
  const proteinProgress = Math.min((totalProtein / proteinGoal) * 100, 100);
  const remainingChars = 500 - mealDescription.length;

  const getMealTypeIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Progress Summary */}
      <Card className="p-6 border-border shadow-card">
        <h3 className="text-lg font-semibold mb-4">Today's Nutrition</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Calories</span>
              <span className="font-medium">{totalCalories} / {calorieGoal} kcal</span>
            </div>
            <Progress value={calorieProgress} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Protein</span>
              <span className="font-medium">{totalProtein} / {proteinGoal}g</span>
            </div>
            <Progress value={proteinProgress} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Log New Meal */}
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Log a Meal</h3>
              <p className="text-sm text-muted-foreground">
                {mode === 'text' ? 'Describe your meal' : 'Take or upload a photo'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={mode === 'text' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('text')}
              className="gap-1"
            >
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Text</span>
            </Button>
            <Button
              variant={mode === 'photo' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setMode('photo')}
              className="gap-1"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Photo</span>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Meal Type</label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                <SelectItem value="lunch">☀️ Lunch</SelectItem>
                <SelectItem value="dinner">🌙 Dinner</SelectItem>
                <SelectItem value="snack">🍎 Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === 'text' ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">What did you eat?</label>
                <Textarea
                  placeholder="e.g., 2 eggs, 2 slices whole wheat toast, 1 banana, black coffee"
                  value={mealDescription}
                  onChange={(e) => {
                    setMealDescription(e.target.value);
                    setValidationError(null);
                  }}
                  maxLength={500}
                  rows={3}
                  className={`resize-none ${validationError ? 'border-destructive' : ''}`}
                />
                <div className="flex justify-between mt-1">
                  {validationError ? (
                    <p className="text-sm text-destructive">{validationError}</p>
                  ) : (
                    <span />
                  )}
                  <p className={`text-xs ${remainingChars < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {remainingChars} characters remaining
                  </p>
                </div>
              </div>

              <Button
                onClick={handleLogMealText}
                disabled={isLoading || mealDescription.trim().length < 3}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Log Meal'
                )}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Meal Photo</label>
                
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Meal preview"
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={clearImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Click to upload a photo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG up to 10MB
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>

              <Button
                onClick={handleLogMealPhoto}
                disabled={isLoading || !selectedImage}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing photo...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Analyze & Log
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Today's Meals */}
      <Card className="p-6 border-border shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Utensils className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Today's Meals</h3>
            <p className="text-sm text-muted-foreground">
              {todayMeals.length} meal{todayMeals.length !== 1 ? 's' : ''} logged
            </p>
          </div>
        </div>

        {isLoadingMeals ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : todayMeals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No meals logged today yet.</p>
            <p className="text-sm mt-1">Start by logging your first meal above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <Card key={meal.id} className="p-4 bg-muted/30 border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getMealTypeIcon(meal.meal_type)}</span>
                    <div>
                      <span className="font-medium capitalize">{meal.meal_type}</span>
                      <p className="text-xs text-muted-foreground">
                        {new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <p className="text-sm font-semibold text-primary">{meal.total_calories} kcal</p>
                      <p className="text-xs text-muted-foreground">{meal.total_protein}g protein</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEditDialog(meal)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this meal?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove the {meal.meal_type} ({meal.total_calories} kcal) from today's log. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteMeal(meal.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(meal.items as MealItem[]).map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-background px-2 py-1 rounded-full"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Meal Dialog */}
      <Dialog open={!!editingMeal} onOpenChange={(open) => !open && setEditingMeal(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Meal Type</label>
              <Select value={editMealType} onValueChange={setEditMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                  <SelectItem value="lunch">☀️ Lunch</SelectItem>
                  <SelectItem value="dinner">🌙 Dinner</SelectItem>
                  <SelectItem value="snack">🍎 Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Items</label>
              {editItems.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateEditItem(idx, 'name', e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">Calories</label>
                        <Input
                          type="number"
                          min={0}
                          value={item.estimated_cal || ""}
                          onChange={(e) => updateEditItem(idx, 'estimated_cal', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">Protein (g)</label>
                        <Input
                          type="number"
                          min={0}
                          value={item.estimated_protein_g || ""}
                          onChange={(e) => updateEditItem(idx, 'estimated_protein_g', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 mt-1 text-muted-foreground hover:text-destructive"
                    onClick={() => removeEditItem(idx)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addEditItem} className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {editItems.length > 0 && (
              <Card className="p-3 bg-muted/30 border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">
                    {editItems.reduce((s, i) => s + i.estimated_cal, 0)} kcal · {editItems.reduce((s, i) => s + i.estimated_protein_g, 0)}g protein
                  </span>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMeal(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
