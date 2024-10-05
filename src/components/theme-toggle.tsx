import { LaptopIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';
import type { IconProps } from '@radix-ui/react-icons/dist/types';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light' | 'system';

const ThemeIconMap: {
  [theme in Theme]: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
} = {
  dark: MoonIcon,
  light: SunIcon,
  system: LaptopIcon,
};

export function ThemeToggle() {
  const { theme: currentTheme, setTheme } = useTheme();
  return (
    <div className="flex">
      {Object.entries(ThemeIconMap).map(([theme, Icon]) => (
        <Button
          key={theme}
          variant="ghost"
          size="icon"
          className={cn(
            'rounded-full text-muted-foreground transition hover:bg-transparent hover:text-primary',
            theme === currentTheme && 'bg-accent hover:bg-accent'
          )}
          onClick={() => setTheme(theme)}
        >
          <Icon className="size-5" />
        </Button>
      ))}
    </div>
  );
}
