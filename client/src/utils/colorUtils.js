// Map of color names to their Tailwind class names
export const COLORS = {
    orange: {
        name: 'orange',
        light: 'bg-orange-100 text-orange-800',
        dark: 'dark:bg-orange-900 dark:text-orange-200'
    },
    blue: {
        name: 'blue',
        light: 'bg-blue-100 text-blue-800',
        dark: 'dark:bg-blue-900 dark:text-blue-200'
    },
    green: {
        name: 'green',
        light: 'bg-green-100 text-green-800',
        dark: 'dark:bg-green-900 dark:text-green-200'
    },
    red: {
        name: 'red',
        light: 'bg-red-100 text-red-800',
        dark: 'dark:bg-red-900 dark:text-red-200'
    },
    purple: {
        name: 'purple',
        light: 'bg-purple-100 text-purple-800',
        dark: 'dark:bg-purple-900 dark:text-purple-200'
    },
    yellow: {
        name: 'yellow',
        light: 'bg-yellow-100 text-yellow-800',
        dark: 'dark:bg-yellow-900 dark:text-yellow-200'
    },
    indigo: {
        name: 'indigo',
        light: 'bg-indigo-100 text-indigo-800',
        dark: 'dark:bg-indigo-900 dark:text-indigo-200'
    },
    pink: {
        name: 'pink',
        light: 'bg-pink-100 text-pink-800',
        dark: 'dark:bg-pink-900 dark:text-pink-200'
    },
    teal: {
        name: 'teal',
        light: 'bg-teal-100 text-teal-800',
        dark: 'dark:bg-teal-900 dark:text-teal-200'
    }
};

export const getColorClasses = (colorName) => {
    const color = COLORS[colorName] || COLORS.orange;
    return `${color.light} ${color.dark}`;
};

// List of available color names for dropdowns
export const COLOR_NAMES = Object.keys(COLORS); 