import express from 'express';

const rawMultipart = express.raw({
  type: (req) => req.is('multipart/form-data'),
  limit: '32mb',
});

function parseContentDisposition(headerValue = '') {
  return headerValue.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawValue.length) return acc;

    acc[rawKey] = rawValue.join('=').replace(/^"|"$/g, '');
    return acc;
  }, {});
}

function parseMultipartBuffer(buffer, boundary) {
  const body = buffer.toString('latin1');
  const boundaryText = `--${boundary}`;
  const fields = {};
  const files = {};

  for (const section of body.split(boundaryText)) {
    if (!section || section === '--\r\n' || section === '--') continue;

    const headerEnd = section.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const rawHeaders = section.slice(0, headerEnd).replace(/^\r\n/, '');
    let content = section.slice(headerEnd + 4);
    content = content.replace(/\r\n--$/, '').replace(/\r\n$/, '');

    const headers = rawHeaders.split('\r\n').reduce((acc, line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return acc;

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      acc[key] = line.slice(separatorIndex + 1).trim();
      return acc;
    }, {});

    const disposition = parseContentDisposition(headers['content-disposition']);
    if (!disposition.name) continue;

    if (disposition.filename) {
      files[disposition.name] = {
        filename: disposition.filename,
        contentType: headers['content-type'] || 'application/octet-stream',
        buffer: Buffer.from(content, 'latin1'),
      };
      continue;
    }

    fields[disposition.name] = Buffer.from(content, 'latin1').toString('utf8');
  }

  return { fields, files };
}

export function multipartForm(req, res, next) {
  rawMultipart(req, res, (error) => {
    if (error) return next(error);
    if (!req.is('multipart/form-data')) return next();

    const boundary = req.headers['content-type']?.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1]
      || req.headers['content-type']?.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2];

    if (!boundary || !Buffer.isBuffer(req.body)) {
      return res.status(400).json({ message: 'Invalid registration payload' });
    }

    const { fields, files } = parseMultipartBuffer(req.body, boundary);
    req.body = fields;
    req.files = files;
    return next();
  });
}
