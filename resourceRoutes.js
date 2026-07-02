const express = require('express');
const router = express.Router();
const {
  getResources, getResourceById, createResource,
  updateResource, deleteResource, toggleBookmark, getBookmarkedResources
} = require('../controllers/resourceController');
const verifyToken = require('../middleware/verifyToken');
const isAdmin = require('../middleware/isAdmin');
const { uploadResource } = require('../utils/cloudinary');

router.get('/', getResources);
router.get('/bookmarked', verifyToken, getBookmarkedResources);
router.get('/:id', getResourceById);
router.post('/', verifyToken, isAdmin, uploadResource.single('file'), createResource);
router.put('/:id', verifyToken, isAdmin, uploadResource.single('file'), updateResource);
router.delete('/:id', verifyToken, isAdmin, deleteResource);
router.post('/:id/bookmark', verifyToken, toggleBookmark);

module.exports = router;
