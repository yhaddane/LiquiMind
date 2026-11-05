import * as XLSX from 'xlsx';
import { StagedTransaction, Category, Account } from '../types';

/**
 * Smart keyword matching for Moroccan & French bank statements
 */
export function guessCategory(description: string, categories: Category[]): string | undefined {
  const desc = description.toLowerCase();

  const rules: Array<{ keywords: string[]; catId: string }> = [
    { keywords: ['salaire', 'atlas digital', 'virement recu de', 'remuneration', 'paie'], catId: 'cat_salary' },
    { keywords: ['cnss', 'allocations familiales', 'amo'], catId: 'cat_family' },
    { keywords: ['loyer', 'bail', 'syndic'], catId: 'cat_rent' },
    { keywords: ['marjane', 'carrefour', 'bim', 'aswak', 'acima', 'label vie', 'supermarche', 'courses'], catId: 'cat_groceries' },
    { keywords: ['boulangerie', 'patisserie', 'paul', 'pain'], catId: 'cat_bakery' },
    { keywords: ['cafe', 'espresso', 'starbucks', 'costa'], catId: 'cat_cafe' },
    { keywords: ['restaurant', 'sqala', 'mcdo', 'mcdonald', 'burger', 'kfc', 'pizza', 'tacos'], catId: 'cat_restaurants' },
    { keywords: ['glovo', 'careem', 'livraison'], catId: 'cat_delivery' },
    { keywords: ['afriquia', 'shell', 'total', 'petrom', 'winxo', 'carburant', 'essence', 'station service'], catId: 'cat_fuel' },
    { keywords: ['lydec', 'redal', 'amendis', 'onee', 'eau', 'electricite'], catId: 'cat_utilities' },
    { keywords: ['orange', 'maroc telecom', 'iam', 'inwi', 'fibre', 'adsl'], catId: 'cat_internet' },
    { keywords: ['recharge', 'forfait', 'gsm', 'telephone'], catId: 'cat_phone' },
    { keywords: ['ecole', 'scolaire', 'universite', 'al jabr', 'creche'], catId: 'cat_school' },
    { keywords: ['pharmacie', 'medicament', 'medecin', 'docteur', 'clinique', 'laboratoire'], catId: 'cat_pharmacy' },
    { keywords: ['netflix', 'spotify', 'prime video', 'youtube', 'disney'], catId: 'cat_streaming' },
    { keywords: ['city club', 'fitness', 'gym', 'sport'], catId: 'cat_gym' },
    { keywords: ['zara', 'h&m', 'celio', 'marwa', 'pull&bear', 'shopping', 'vetement'], catId: 'cat_shopping' },
    { keywords: ['hammam', 'coiffeur', 'barbier', 'spa', 'massage'], catId: 'cat_hammam' },
    { keywords: ['technopark', 'coworking'], catId: 'cat_pro_coworking' },
    { keywords: ['adobe', 'figma', 'jetbrains', 'github', 'openai', 'claude'], catId: 'cat_pro_software' },
    { keywords: ['cabinet', 'fiduciaire', 'expert comptable', 'comptable'], catId: 'cat_pro_accountant' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some((k) => desc.includes(k))) {
      const found = categories.find((c) => c.id === rule.catId);
      if (found) return found.id;
    }
  }

  // Fallback match by category name
  const exactMatch = categories.find((c) => !c.isGroup && desc.includes(c.name.toLowerCase()));
  return exactMatch?.id;
}

/**
 * Standardize dates in DD/MM/YYYY or YYYY-MM-DD or Excel serial to YYYY-MM-DD
 */
export function normalizeDate(raw: unknown): string {
  if (!raw) return new Date().toISOString().slice(0, 10);

  // If already YYYY-MM-DD
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
    return raw.trim();
  }

  // If DD/MM/YYYY or DD-MM-YYYY
  if (typeof raw === 'string') {
    const match = raw.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      return `${year}-${month}-${day}`;
    }
  }

  // If Date object
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10);
  }

  // If number (Excel date code)
  if (typeof raw === 'number' && raw > 20000 && raw < 70000) {
    const date = new Date((raw - (25567 + 2)) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
  }

  return new Date().toISOString().slice(0, 10);
}

/**
 * Clean and parse numeric amount
 */
export function parseAmountValue(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  let str = String(val).trim();
  // Remove currency signs, spaces
  str = str.replace(/[^\d.,+-]/g, '');
  // Handle French comma decimal separator: "1.250,50" -> 1250.50
  if (str.includes(',') && str.includes('.')) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse an Excel / CSV File (.xlsx, .xls, .csv)
 */
export async function parseExcelOrCsvFile(
  file: File,
  categories: Category[],
  defaultAccountId: string
): Promise<StagedTransaction[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  const rawRows: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const results: StagedTransaction[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const keys = Object.keys(row);

    // Find date field
    let dateVal: unknown = '';
    let descVal: unknown = '';
    let debitVal: unknown = 0;
    let creditVal: unknown = 0;
    let amountVal: unknown = 0;

    for (const k of keys) {
      const lk = k.toLowerCase().trim();
      const val = row[k];

      if (lk.includes('date') || lk === 'd') {
        dateVal = val;
      } else if (
        lk.includes('libell') ||
        lk.includes('desc') ||
        lk.includes('motif') ||
        lk.includes('operat') ||
        lk.includes('nom') ||
        lk.includes('detail')
      ) {
        descVal = val;
      } else if (lk.includes('debit') || lk === 'retrait') {
        debitVal = val;
      } else if (lk.includes('credit') || lk === 'versement') {
        creditVal = val;
      } else if (lk.includes('montant') || lk.includes('solde') || lk === 'amount') {
        amountVal = val;
      }
    }

    const dateStr = normalizeDate(dateVal);
    let description = String(descVal || `Opération ${i + 1}`).trim();
    if (!description && !dateVal) continue; // empty line

    let finalAmount = 0;
    const debit = parseAmountValue(debitVal);
    const credit = parseAmountValue(creditVal);
    const directAmount = parseAmountValue(amountVal);

    if (debit > 0) {
      finalAmount = -Math.abs(debit);
    } else if (credit > 0) {
      finalAmount = Math.abs(credit);
    } else if (directAmount !== 0) {
      finalAmount = directAmount;
    }

    if (finalAmount === 0 && !description) continue;
    if (!description) description = finalAmount > 0 ? 'Virement / Revenu' : 'Dépense carte / prélèvement';

    const categoryId = guessCategory(description, categories);

    results.push({
      id: `staged_${Date.now()}_${i}`,
      date: dateStr,
      description,
      amount: finalAmount,
      categoryId,
      accountId: defaultAccountId,
      sourceType: file.name.endsWith('.csv') ? 'csv' : 'excel',
    });
  }

  return results;
}

/**
 * Parse Bank Statement text from PDF or Word/Text document
 */
export async function parseStatementText(
  text: string,
  categories: Category[],
  defaultAccountId: string,
  sourceType: 'pdf' | 'word' | 'csv' = 'pdf'
): Promise<StagedTransaction[]> {
  const lines = text.split(/\r?\n/);
  const results: StagedTransaction[] = [];
  let counter = 0;

  // Regex matches dates like 05/11/2026 or 05-11-2026 or 2026-11-05
  const dateRegex = /(\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b)/;
  // Regex matches Moroccan or European amounts like "1 450,00" or "-450.00" or "+21 000 DH"
  const amountRegex = /([+-]?\s*\d{1,3}(?:[ \s.]\d{3})*(?:,\d{1,2}|\.\d{1,2})?)\s*(?:DH|MAD|€|\$)?\b/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 5) continue;

    const dateMatch = trimmed.match(dateRegex);
    if (!dateMatch) continue;

    const dateStr = normalizeDate(dateMatch[1]);
    
    // Remove the date from the line to find description and amount
    const rest = trimmed.replace(dateMatch[0], '').trim();
    const amountMatch = rest.match(amountRegex);

    if (amountMatch) {
      const rawAmountStr = amountMatch[1];
      const parsedAmount = parseAmountValue(rawAmountStr);
      if (parsedAmount !== 0) {
        // Description is the rest of the line without the amount
        let desc = rest.replace(amountMatch[0], '').replace(/[|;,\t]/g, ' ').trim();
        if (!desc || desc.length < 2) {
          desc = parsedAmount > 0 ? 'Revenu / Virement reçu' : 'Paiement / Débit relevé';
        }

        const categoryId = guessCategory(desc, categories);
        results.push({
          id: `staged_txt_${Date.now()}_${counter++}`,
          date: dateStr,
          description: desc,
          amount: parsedAmount,
          categoryId,
          accountId: defaultAccountId,
          sourceType,
        });
      }
    }
  }

  return results;
}
