const fs = require('fs');

const path = 'src/app/components/orders/OrderEntryForm.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Center the form and cap max width (if it's not already capped).
// The form tag looks like: <form onSubmit={handleSubmit} className="space-y-8">
content = content.replace(
  '<form onSubmit={handleSubmit} className="space-y-8">',
  '<form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">'
);

// 2. Change <label> classes globally:
// From: className="block text-sm font-medium text-slate-700 mb-1"
// To: className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5"
content = content.replace(
  /className="block text-sm font-medium text-slate-700 mb-1( text-[a-z]+-\d+)?"/g,
  (match, p1) => {
    const extraColor = p1 ? p1 : ''; // e.g. text-fuchsia-700
    // If they have an extra color, we retain it but still make it uppercase/small
    if (extraColor) {
        return `className="block text-[11px] uppercase font-bold ${extraColor.trim()} tracking-wider mb-1.5"`;
    }
    return `className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5"`;
  }
);

// 3. Change input / select classes for Touch Target (py-2 -> py-2.5) and 16px Font (text-sm -> text-base):
// Example: className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
content = content.replace(/className="([^"]*(?:input|select|textarea|border-slate-300|border-fuchsia-300|border-emerald-300)[^"]*)"/g, (match, classStr) => {
    if (classStr.includes('px-4')) {
        let newStr = classStr;
        // Make font 16px (text-base)
        if (newStr.includes('text-sm')) {
            newStr = newStr.replace('text-sm', 'text-base');
        } else if (!newStr.includes('text-base')) {
            newStr += ' text-base';
        }
        
        // Make padding larger for touch target
        newStr = newStr.replace('py-2', 'py-2.5');
        
        return `className="${newStr}"`;
    }
    return match; // Don't modify if it fails our generic structural heuristic
});

// 4. Update the Grid 3-column layout to be responsive gracefully
content = content.replace(
   '<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">',
   '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">'
);

fs.writeFileSync(path, content, 'utf8');
console.log('UI Standardized successfully.');
