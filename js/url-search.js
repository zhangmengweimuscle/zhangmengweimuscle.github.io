/**
 * URL-based search functionality for categories and tags
 */
(function() {
  'use strict';

  // Utility functions for URL handling
  window.UrlSearch = {
    // Get URL parameter
    getParameter: function(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },

    // Get category from URL path
    // Handles both single-level (/categories/cat-name/) and nested (/categories/parent/child/) paths
    getCategoryFromPath: function() {
      var path = window.location.pathname;
      // Match all path segments after /categories/
      var matches = path.match(/\/categories\/(.+)/);
      if (matches) {
        try {
          // Split by '/' and get the last segment (the actual category name)
          var segments = matches[1].split('/').filter(function(s) { return s.length > 0; });
          if (segments.length === 0) return '';
          
          // Get the last segment (for nested categories like /categories/parent/child/)
          var lastSegment = segments[segments.length - 1];
          
          // Try to decode the category name
          var decoded = decodeURIComponent(lastSegment);
          // Handle potential double encoding
          try {
            decoded = decodeURIComponent(decoded);
          } catch (e) {
            // If double decoding fails, use the first decoded result
          }
          return decoded;
        } catch (e) {
          console.error('Error decoding category from path:', e);
          return matches[1].split('/').filter(function(s) { return s.length > 0; }).pop();
        }
      }
      return '';
    },

    // Get tag from URL path
    getTagFromPath: function() {
      var path = window.location.pathname;
      var match = path.match(/\/tags\/([^\/]+)/);
      if (match) {
        try {
          // Try to decode the tag name
          var decoded = decodeURIComponent(match[1]);
          // Handle potential double encoding
          try {
            decoded = decodeURIComponent(decoded);
          } catch (e) {
            // If double decoding fails, use the first decoded result
          }
          return decoded;
        } catch (e) {
          console.error('Error decoding tag from path:', e);
          return match[1];
        }
      }
      return '';
    },

    // Navigate to category search
    searchCategory: function(categoryName) {
      if (!categoryName) return;
      // Ensure category name is properly encoded
      var encodedCategory = encodeURIComponent(categoryName);
      window.location.href = '/categories/?category=' + encodedCategory;
    },

    // Navigate to tag search
    searchTag: function(tagName) {
      if (!tagName) return;
      // Ensure tag name is properly encoded
      var encodedTag = encodeURIComponent(tagName);
      window.location.href = '/tags/?tag=' + encodedTag;
    },

    // Handle direct URL navigation
    handleDirectNavigation: function() {
      var currentPath = window.location.pathname;
      
      // Handle categories direct navigation
      if (currentPath.startsWith('/categories/') && currentPath.length > 12) {
        var category = this.getCategoryFromPath();
        if (category) {
          // Use href instead of replace to allow proper navigation
          window.location.href = '/categories/?category=' + encodeURIComponent(category);
        }
      }
      
      // Handle tags direct navigation
      if (currentPath.startsWith('/tags/') && currentPath.length > 6) {
        var tag = this.getTagFromPath();
        if (tag) {
          // Use href instead of replace to allow proper navigation
          window.location.href = '/tags/?tag=' + encodeURIComponent(tag);
        }
      }
    }
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    UrlSearch.handleDirectNavigation();
  });
})();
