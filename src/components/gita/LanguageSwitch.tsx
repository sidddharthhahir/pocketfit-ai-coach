import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const LanguageSwitch = () => {
  const { i18n, t } = useTranslation("gita");
  const current = i18n.language?.startsWith("hi") ? "hi" : "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground">
          <Languages className="w-3 h-3 mr-1" />
          {current === "hi" ? "हिन्दी" : "EN"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuItem onClick={() => i18n.changeLanguage("en")}>
          {t("english")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage("hi")}>
          {t("hindi")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
