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
    getCategoryFromPath: function() {
      var path = window.location.pathname;
      var match = path.match(/\/categories\/([^\/]+)/);
      return match ? decodeURIComponent(match[1]) : '';
    },

    // Get tag from URL path
    getTagFromPath: function() {
      var path = window.location.pathname;
      var match = path.match(/\/tags\/([^\/]+)/);
      return match ? decodeURIComponent(match[1]) : '';
    },

    // Navigate to category search
    searchCategory: function(categoryName) {
      window.location.href = '/categories/?category=' + encodeURIComponent(categoryName);
    },

    // Navigate to tag search
    searchTag: function(tagName) {
      window.location.href = '/tags/?tag=' + encodeURIComponent(tagName);
    },

    // Handle direct URL navigation
    handleDirectNavigation: function() {
      var currentPath = window.location.pathname;
      
      // Handle categories direct navigation
      if (currentPath.startsWith('/categories/') && currentPath.length > 12) {
        var category = this.getCategoryFromPath();
        if (category) {
          window.location.replace('/categories/?category=' + encodeURIComponent(category));
        }
      }
      
      // Handle tags direct navigation
      if (currentPath.startsWith('/tags/') && currentPath.length > 6) {
        var tag = this.getTagFromPath();
        if (tag) {
          window.location.replace('/tags/?tag=' + encodeURIComponent(tag));
        }
      }
    }
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    UrlSearch.handleDirectNavigation();
  });
})();
