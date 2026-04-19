const repsJson = JSON.stringify([{"name":"ABDULLAH HÜSEYİN","nameEn":"ABDULLAH HUSEYIN KILIC","title":"VICE PRESIDENT","phone":"+90 533 5581409","email":"HK@usktextile.com"}]);
const company = { repsJson };
const repName = 'ABDULLAH HÜSEYİN|ABDULLAH HUSEYIN KILIC';
const reps = JSON.parse(company.repsJson);
const nameToMatch = repName.includes('|') ? repName.split('|')[0].trim().toUpperCase() : repName.trim().toUpperCase();
const found = reps.find((r) => { 
    const raw = r.name || ''; 
    const n = raw.includes('|') ? raw.split('|')[0] : raw;
    return n.trim().toUpperCase() === nameToMatch; 
});
console.log(found?.email?.toLowerCase() || '-');
