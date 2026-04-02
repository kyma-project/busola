import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configurable kubeconfig directory via env variable, default to ./config/kubeconfigs
const KUBECONFIG_DIR = process.env.KUBECONFIG_DIR
  ? path.resolve(process.env.KUBECONFIG_DIR)
  : path.resolve('./config/kubeconfigs');

function resolveKubeconfigPath(id) {
  // Append .yaml extension if not already present
  const filename = id.endsWith('.yaml') ? id : `${id}.yaml`;
  return path.resolve(KUBECONFIG_DIR, filename);
}

function isValidId(id) {
  // Prevent path traversal: only allow alphanumeric, hyphens, underscores, dots
  return typeof id === 'string' && /^[a-zA-Z0-9._-]+$/.test(id);
}

// GET /kubeconfig — list all available kubeconfig IDs
router.get('/', (req, res) => {
  if (!fs.existsSync(KUBECONFIG_DIR)) {
    return res.json([]);
  }

  try {
    const files = fs
      .readdirSync(KUBECONFIG_DIR)
      .filter((f) => f.endsWith('.yaml'))
      .map((f) => f.replace(/\.yaml$/, ''));
    return res.json(files);
  } catch (e) {
    return res.status(500).json({ Error: e.message });
  }
});

// GET /kubeconfig/:id — serve a specific kubeconfig, appending .yaml to find the file
router.get('/:id', (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ Error: 'Invalid kubeconfig ID' });
  }

  const kubeconfigPath = resolveKubeconfigPath(id);

  // Prevent path traversal: ensure resolved path is inside KUBECONFIG_DIR
  if (
    !kubeconfigPath.startsWith(KUBECONFIG_DIR + path.sep) &&
    kubeconfigPath !== KUBECONFIG_DIR
  ) {
    return res.status(400).json({ Error: 'Invalid kubeconfig ID' });
  }

  if (!fs.existsSync(kubeconfigPath)) {
    return res.status(404).json({ Error: `Kubeconfig '${id}' not found` });
  }

  try {
    const content = fs.readFileSync(kubeconfigPath, 'utf8');
    res.setHeader('Content-Type', 'text/yaml');
    return res.send(content);
  } catch (e) {
    return res.status(500).json({ Error: e.message });
  }
});

export default router;
