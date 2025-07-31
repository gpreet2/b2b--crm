import {
  sanitizeHtml,
  sanitizeText,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeFileName,
  sanitizeHexColor,
  sanitizeObject,
  sanitizeArray,
  sanitizeSqlIdentifier,
  createSlug,
  sanitizeSearchQuery,
  sanitizeJson,
  createInitials,
  maskSensitiveData,
  sanitizeCreditCard,
  sanitizers
} from '../utils/sanitization';

describe('Sanitization Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should remove dangerous HTML tags', () => {
      const input = '<script>alert("XSS")</script><p>Safe content</p>';
      const result = sanitizeHtml(input);
      expect(result).toBe('<p>Safe content</p>');
      expect(result).not.toContain('script');
    });

    it('should allow specified tags', () => {
      const input = '<b>Bold</b> <i>Italic</i> <div>Not allowed</div>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<b>Bold</b>');
      expect(result).toContain('<i>Italic</i>');
      expect(result).not.toContain('<div>');
    });

    it('should respect maxLength option', () => {
      const input = '<p>This is a very long text that should be truncated</p>';
      const result = sanitizeHtml(input, { maxLength: 20 });
      expect(result.length).toBeLessThanOrEqual(20);
    });

    it('should handle custom allowed tags', () => {
      const input = '<h1>Title</h1><p>Content</p><span>Span</span>';
      const result = sanitizeHtml(input, { allowedTags: ['h1', 'p'] });
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<p>Content</p>');
      expect(result).not.toContain('<span>');
    });
  });

  describe('sanitizeText', () => {
    it('should remove HTML tags from text', () => {
      const input = 'Hello <script>alert("XSS")</script>World';
      const result = sanitizeText(input);
      expect(result).toBe('Hello World');
    });

    it('should normalize whitespace', () => {
      const input = '  Multiple   spaces   and\n\nnewlines  ';
      const result = sanitizeText(input);
      expect(result).toBe('Multiple spaces and newlines');
    });

    it('should remove control characters', () => {
      const input = 'Normal\x00Text\x1FWith\x7FControl\nChars';
      const result = sanitizeText(input);
      // Whitespace normalization converts newlines to spaces
      expect(result).toBe('NormalTextWithControl Chars');
    });

    it('should respect maxLength', () => {
      const input = 'This is a long text that should be truncated';
      const result = sanitizeText(input, 10);
      expect(result).toBe('This is a ');
      expect(result.length).toBe(10);
    });
  });

  describe('sanitizeEmail', () => {
    it('should lowercase and trim email', () => {
      expect(sanitizeEmail('  John.Doe@EXAMPLE.COM  ')).toBe('john.doe@example.com');
    });

    it('should remove spaces from email', () => {
      expect(sanitizeEmail('john doe @ example.com')).toBe('johndoe@example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizePhone('(123) 456-7890', false)).toBe('1234567890');
    });

    it('should preserve international format', () => {
      expect(sanitizePhone('+1 (123) 456-7890')).toBe('+11234567890');
    });

    it('should add US country code to 10-digit numbers', () => {
      expect(sanitizePhone('123-456-7890')).toBe('+11234567890');
    });

    it('should handle empty input', () => {
      expect(sanitizePhone('')).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid HTTP/HTTPS URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://example.com/path')).toBe('http://example.com/path');
    });

    it('should reject javascript URLs', () => {
      expect(sanitizeUrl('javascript:alert("XSS")')).toBe('');
      expect(sanitizeUrl('JavaScript:void(0)')).toBe('');
    });

    it('should reject data URLs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBe('');
    });

    it('should reject invalid protocols', () => {
      expect(sanitizeUrl('ftp://example.com')).toBe('');
      expect(sanitizeUrl('file:///etc/passwd')).toBe('');
    });

    it('should handle malformed URLs', () => {
      expect(sanitizeUrl('not a url')).toBe('');
      expect(sanitizeUrl('http://')).toBe('');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove path separators', () => {
      expect(sanitizeFileName('../../etc/passwd')).toBe('etcpasswd');
      expect(sanitizeFileName('folder\\file.txt')).toBe('folderfile.txt');
    });

    it('should remove special characters', () => {
      expect(sanitizeFileName('file<>:"|?*.txt')).toBe('file.txt');
    });

    it('should remove leading dots', () => {
      expect(sanitizeFileName('...hidden.txt')).toBe('hidden.txt');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result.endsWith('.txt')).toBe(true);
    });

    it('should handle empty input', () => {
      expect(sanitizeFileName('')).toBe('unnamed');
    });
  });

  describe('sanitizeHexColor', () => {
    it('should accept valid hex colors', () => {
      expect(sanitizeHexColor('#FF5733')).toBe('#FF5733');
      expect(sanitizeHexColor('FF5733')).toBe('#FF5733');
      expect(sanitizeHexColor('#abc123')).toBe('#abc123');
    });

    it('should remove invalid characters', () => {
      expect(sanitizeHexColor('#FF57ZZ')).toBe('#000000');
      expect(sanitizeHexColor('GGGGGG')).toBe('#000000');
    });

    it('should return default for invalid format', () => {
      expect(sanitizeHexColor('#FF5')).toBe('#000000');
      expect(sanitizeHexColor('#FF57333')).toBe('#000000');
    });
  });

  describe('sanitizeObject', () => {
    it('should remove null, undefined, and empty string values', () => {
      const input = {
        name: 'John',
        age: null,
        email: '',
        phone: undefined,
        city: 'New York'
      };
      const result = sanitizeObject(input);
      expect(result).toEqual({
        name: 'John',
        city: 'New York'
      });
    });

    it('should sanitize string values', () => {
      const input = {
        name: '  John  <script>alert("XSS")</script>  ',
        description: 'Normal text'
      };
      const result = sanitizeObject(input);
      expect(result.name).toBe('John');
      expect(result.description).toBe('Normal text');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: 'John',
          email: null,
          profile: {
            bio: '  Bio text  ',
            age: 25
          }
        }
      };
      const result = sanitizeObject(input);
      expect(result).toEqual({
        user: {
          name: 'John',
          profile: {
            bio: 'Bio text',
            age: 25
          }
        }
      });
    });
  });

  describe('sanitizeArray', () => {
    it('should remove null, undefined, and empty values', () => {
      const input = ['a', null, 'b', undefined, '', 'c'];
      const result = sanitizeArray(input);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should remove duplicates', () => {
      const input = ['a', 'b', 'a', 'c', 'b', 'd'];
      const result = sanitizeArray(input);
      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('sanitizeSqlIdentifier', () => {
    it('should only allow alphanumeric and underscore', () => {
      expect(sanitizeSqlIdentifier('table_name')).toBe('table_name');
      expect(sanitizeSqlIdentifier('table-name')).toBe('tablename');
      expect(sanitizeSqlIdentifier('table.name')).toBe('tablename');
      expect(sanitizeSqlIdentifier('table;DROP TABLE users;')).toBe('tableDROPTABLEusers');
    });
  });

  describe('createSlug', () => {
    it('should create URL-safe slugs', () => {
      expect(createSlug('Hello World!')).toBe('hello-world');
      expect(createSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(createSlug('Special@#$Characters')).toBe('specialcharacters');
      expect(createSlug('---Leading-Trailing---')).toBe('leading-trailing');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeSearchQuery('normal search')).toBe('normal search');
      expect(sanitizeSearchQuery('search<script>alert("XSS")</script>')).toBe('searchscriptalertXSSscript');
      expect(sanitizeSearchQuery('"quoted" search')).toBe('quoted search');
    });

    it('should normalize whitespace', () => {
      expect(sanitizeSearchQuery('  multiple   spaces  ')).toBe('multiple spaces');
    });

    it('should limit length', () => {
      const longQuery = 'a'.repeat(300);
      const result = sanitizeSearchQuery(longQuery);
      expect(result.length).toBe(255);
    });
  });

  describe('sanitizeJson', () => {
    it('should parse and stringify valid JSON', () => {
      const input = '{"name": "John", "age": 30}';
      const result = sanitizeJson(input);
      expect(result).toBe('{"name":"John","age":30}');
    });

    it('should return empty object for invalid JSON', () => {
      expect(sanitizeJson('invalid json')).toBe('{}');
      expect(sanitizeJson('{broken: json}')).toBe('{}');
    });
  });

  describe('createInitials', () => {
    it('should create uppercase initials', () => {
      expect(createInitials('john', 'doe')).toBe('JD');
      expect(createInitials('Mary', 'Smith')).toBe('MS');
    });

    it('should handle names with HTML', () => {
      expect(createInitials('<b>John</b>', '<i>Doe</i>')).toBe('JD');
    });

    it('should handle empty names', () => {
      expect(createInitials('', '')).toBe('');
      expect(createInitials('John', '')).toBe('J');
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask data with default visible chars', () => {
      expect(maskSensitiveData('1234567890')).toBe('1234******');
      expect(maskSensitiveData('secret')).toBe('secr****');
    });

    it('should handle custom visible chars', () => {
      expect(maskSensitiveData('password123', 2)).toBe('pa*********');
    });

    it('should handle short strings', () => {
      expect(maskSensitiveData('abc', 4)).toBe('***');
      expect(maskSensitiveData('ab')).toBe('**');
    });
  });

  describe('sanitizeCreditCard', () => {
    it('should remove non-numeric characters', () => {
      expect(sanitizeCreditCard('1234-5678-9012-3456')).toBe('1234567890123456');
      expect(sanitizeCreditCard('1234 5678 9012 3456')).toBe('1234567890123456');
    });

    it('should validate card length', () => {
      expect(sanitizeCreditCard('123456789012')).toBe(''); // Too short
      expect(sanitizeCreditCard('12345678901234567890')).toBe(''); // Too long
      expect(sanitizeCreditCard('1234567890123')).toBe('1234567890123'); // Valid (13 digits)
    });
  });

  describe('sanitizers object', () => {
    it('should expose all sanitization functions', () => {
      expect(typeof sanitizers.html).toBe('function');
      expect(typeof sanitizers.text).toBe('function');
      expect(typeof sanitizers.email).toBe('function');
      expect(typeof sanitizers.phone).toBe('function');
      expect(typeof sanitizers.url).toBe('function');
      expect(typeof sanitizers.fileName).toBe('function');
      expect(typeof sanitizers.hexColor).toBe('function');
      expect(typeof sanitizers.object).toBe('function');
      expect(typeof sanitizers.array).toBe('function');
      expect(typeof sanitizers.sqlIdentifier).toBe('function');
      expect(typeof sanitizers.slug).toBe('function');
      expect(typeof sanitizers.searchQuery).toBe('function');
      expect(typeof sanitizers.json).toBe('function');
      expect(typeof sanitizers.initials).toBe('function');
      expect(typeof sanitizers.mask).toBe('function');
      expect(typeof sanitizers.creditCard).toBe('function');
    });
  });
});