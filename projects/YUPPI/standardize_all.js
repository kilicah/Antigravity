const fs = require('fs');

const files = [
  'src/app/companies/components/CompanyFormClient.tsx',
  'src/app/invoices/new/InvoiceFormClient.tsx'
];

files.forEach(path => {
    if(!fs.existsSync(path)) return;
    
    let content = fs.readFileSync(path, 'utf8');

    // Make sure we have a width cap
    if (content.includes('<form onSubmit={handleSubmit} className="space-y-6">')) {
        content = content.replace('<form onSubmit={handleSubmit} className="space-y-6">', '<form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">');
    }
    
    if (content.includes('<form onSubmit={handleSubmit} className="space-y-8">')) {
        content = content.replace('<form onSubmit={handleSubmit} className="space-y-8">', '<form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">');
    }

    // Replace inputs
    content = content.replace(/className="([^"]*(?:input|select|textarea|border-slate-300)[^"]*)"/g, (match, classStr) => {
        if (classStr.includes('px-4') || classStr.includes('px-3')) {
            let newStr = classStr;
            // 16px Font
            if (newStr.includes('text-sm')) {
                newStr = newStr.replace('text-sm', 'text-base');
            } else if (!newStr.includes('text-base')) {
                newStr += ' text-base';
            }
            
            // Touch Target Pad
            if(newStr.includes('py-2 ')) {
                newStr = newStr.replace('py-2 ', 'py-2.5 ');
            } else if (newStr.endsWith('py-2')) {
                newStr = newStr.replace(/py-2$/, 'py-2.5');
            } else if (!newStr.includes('py-2.5')) {
                newStr += ' py-2.5';
            }
            return `className="${newStr}"`;
        }
        return match;
    });

    // Replace labels
    content = content.replace(
      /className="block text-sm font-medium text-slate-700 mb-1( text-[a-z]+-\d+)?"/g,
      (match, p1) => {
        const extraColor = p1 ? p1 : '';
        if (extraColor) {
            return `className="block text-[11px] uppercase font-bold tracking-wider mb-1.5 ${extraColor.trim()}"`;
        }
        return `className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5"`;
      }
    );
    
    // Replace Company Form label specific matches (might be text-gray-700 instead of slate)
    content = content.replace(
        /className="block text-sm font-medium text-gray-700 mb-1"/g,
        'className="block text-[11px] uppercase font-bold text-slate-500 tracking-wider mb-1.5"'
    );

    fs.writeFileSync(path, content, 'utf8');
    console.log('Standardized: ' + path);
});
