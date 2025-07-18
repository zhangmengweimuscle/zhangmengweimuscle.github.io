// Comprehensive Search Functionality for Hexo Blog
(function() {
  'use strict';

  // Search index will be populated with all posts
  var searchIndex = [];
  var isIndexLoaded = false;

  // Load search index from all posts
  function loadSearchIndex() {
    if (isIndexLoaded) return Promise.resolve(searchIndex);

    return fetch('/search-index.json')
      .then(response => response.json())
      .then(data => {
        searchIndex = data;
        isIndexLoaded = true;
        return searchIndex;
      })
      .catch(error => {
        console.warn('Failed to load search index, falling back to local search');
        return loadLocalSearchIndex();
      });
  }

  // Fallback: create search index from local posts
  function loadLocalSearchIndex() {
    // This would be populated by server-side generation
    // For now, we'll use the posts available on the current page
    return Promise.resolve([]);
  }

  // Search through all posts
  function searchPosts(query, allPosts) {
    if (!query.trim()) return [];

    var searchTerms = query.toLowerCase().split(/\s+/);
    
    return allPosts.filter(function(post) {
      var searchableText = (post.title + ' ' + 
                           post.content + ' ' + 
                           post.tags.join(' ') + ' ' + 
                           post.categories.join(' ')).toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    }).map(function(post) {
      // Calculate relevance score
      var score = 0;
      var titleLower = post.title.toLowerCase();
      var contentLower = post.content.toLowerCase();
      
      searchTerms.forEach(function(term) {
        if (titleLower.includes(term)) score += 10;
        if (contentLower.includes(term)) score += 1;
      });
      
      post.score = score;
      return post;
    }).sort((a, b) => b.score - a.score);
  }

  // Display search results
  function displaySearchResults(results, query) {
    var searchResults = document.getElementById('search-results');
    if (!searchResults) return;

    searchResults.innerHTML = '';
    
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results">没有找到相关文章</div>';
    } else {
      results.forEach(function(result) {
        var item = document.createElement('div');
        item.className = 'search-result-item';
        
        var highlightedTitle = highlightText(result.title, query);
        var highlightedExcerpt = highlightText(
          truncateText(stripHtml(result.content), 150), 
          query
        );
        
        item.innerHTML = `
          <div class="search-result-title">${highlightedTitle}</div>
          <div class="search-result-excerpt">${highlightedExcerpt}</div>
          <div class="search-result-meta">
            <span>${result.date}</span>
            ${result.categories.length ? `<span> · ${result.categories.join(', ')}</span>` : ''}
          </div>
        `;
        
        item.addEventListener('click', function() {
          window.location.href = result.url;
        });
        
        searchResults.appendChild(item);
      });
    }
    
    searchResults.style.display = 'block';
  }

  // Helper functions
  function highlightText(text, query) {
    if (!query) return text;
    var regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  // Initialize comprehensive search
  function initComprehensiveSearch() {
    var searchInput = document.getElementById('search-input');
    var searchClear = document.getElementById('search-clear');
    var searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;

    // Load all posts data
    var allPosts = [];
    
    // Try to get posts from the current page first
    var postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
      var postElements = postsContainer.querySelectorAll('.post-type-compact');
      postElements.forEach(function(postEl) {
        var title = postEl.querySelector('.post-title-link').textContent;
        var url = postEl.querySelector('.post-title-link').href;
        var excerpt = postEl.querySelector('.post-excerpt').textContent;
        var date = postEl.querySelector('.post-date').textContent;
        var categories = Array.from(postEl.querySelectorAll('.category-tag')).map(tag => tag.textContent);
        var tags = Array.from(postEl.querySelectorAll('.tag')).map(tag => tag.textContent.replace('#', ''));
        
        allPosts.push({
          title: title,
          url: url,
          content: excerpt,
          date: date,
          categories: categories,
          tags: tags
        });
      });
    }

    // Enhanced search with all posts
    function performComprehensiveSearch(query) {
      if (!query.trim()) {
        searchResults.style.display = 'none';
        // Show all posts
        if (postsContainer) {
          var postElements = postsContainer.querySelectorAll('.post-type-compact');
          postElements.forEach(el => el.style.display = 'block');
        }
        return;
      }

      var results = searchPosts(query, allPosts);
      displaySearchResults(results, query);
      
      // Hide non-matching posts from current page
      if (postsContainer) {
        var postElements = postsContainer.querySelectorAll('.post-type-compact');
        var resultUrls = results.map(r => r.url);
        
        postElements.forEach(function(postEl) {
          var url = postEl.querySelector('.post-title-link').href;
          if (resultUrls.includes(url)) {
            postEl.style.display = 'block';
          } else {
            postEl.style.display = 'none';
          }
        });
      }
    }

    // Event listeners
    searchInput.addEventListener('input', function(e) {
      var query = e.target.value;
      performComprehensiveSearch(query);
      
      // Show/hide clear button
      if (query.trim()) {
        searchClear.style.display = 'block';
      } else {
        searchClear.style.display = 'none';
      }
    });

    searchClear.addEventListener('click', function() {
      searchInput.value = '';
      searchResults.style.display = 'none';
      if (postsContainer) {
        var postElements = postsContainer.querySelectorAll('.post-type-compact');
        postElements.forEach(el => el.style.display = 'block');
      }
      searchClear.style.display = 'none';
      searchInput.focus();
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
      var searchContainer = document.querySelector('.search-container');
      if (searchContainer && !searchContainer.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        searchResults.style.display = 'none';
        searchInput.blur();
      }
    });

    // Load additional posts via AJAX
    loadAdditionalPosts();
  }

  // Load additional posts from archives
  function loadAdditionalPosts() {
    // This is a simplified version - in production, you'd want to:
    // 1. Generate a JSON file with all posts during build
    // 2. Or use a proper search plugin
    
    // For now, we'll enhance the current search with better indexing
    var searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Create a more comprehensive search index
    var enhancedPosts = [];
    
    // Add current page posts
    var postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
      var postElements = postsContainer.querySelectorAll('.post-type-compact');
      postElements.forEach(function(postEl) {
        var title = postEl.querySelector('.post-title-link').textContent;
        var url = postEl.querySelector('.post-title-link').href;
        var excerpt = postEl.querySelector('.post-excerpt').textContent;
        var date = postEl.querySelector('.post-date').textContent;
        var categories = Array.from(postEl.querySelectorAll('.category-tag')).map(tag => tag.textContent);
        var tags = Array.from(postEl.querySelectorAll('.tag')).map(tag => tag.textContent.replace('#', ''));
        
        enhancedPosts.push({
          title: title,
          url: url,
          content: excerpt,
          date: date,
          categories: categories,
          tags: tags
        });
      });
    }

    // Store for global access
    window.blogPosts = enhancedPosts;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComprehensiveSearch);
  } else {
    initComprehensiveSearch();
  }

  // Make search available globally
  window.BlogSearch = {
    search: searchPosts,
    highlight: highlightText
  };

})();
