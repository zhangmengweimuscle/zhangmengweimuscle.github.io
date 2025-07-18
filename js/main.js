// GitHub Style Theme JavaScript

(function() {
  'use strict';

  // Mobile sidebar toggle
  function initSidebarToggle() {
    var sidebarToggle = document.querySelector('.sidebar-toggle');
    var sidebar = document.querySelector('#sidebar');
    var container = document.querySelector('#container');
    
    if (!sidebarToggle || !sidebar) return;
    
    sidebarToggle.addEventListener('click', function(e) {
      e.preventDefault();
      sidebar.classList.toggle('sidebar-active');
      container.classList.toggle('sidebar-active');
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
      if (sidebar.classList.contains('sidebar-active') && 
          !sidebar.contains(e.target) && 
          !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('sidebar-active');
        container.classList.remove('sidebar-active');
      }
    });
  }

  // Search form toggle
  function initSearchToggle() {
    var searchBtn = document.querySelector('#nav-search-btn');
    var searchForm = document.querySelector('#search-form-wrap');
    
    if (!searchBtn || !searchForm) return;
    
    searchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      searchForm.classList.toggle('on');
      
      if (searchForm.classList.contains('on')) {
        var input = searchForm.querySelector('.search-form-input');
        if (input) input.focus();
      }
    });
    
    // Close search form when clicking outside
    document.addEventListener('click', function(e) {
      if (searchForm.classList.contains('on') && 
          !searchForm.contains(e.target) && 
          !searchBtn.contains(e.target)) {
        searchForm.classList.remove('on');
      }
    });
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Back to top button
  function initBackToTop() {
    var backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTop.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 40px; height: 40px; background: #0366d6; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.3s; z-index: 1000;';
    
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTop.style.opacity = '1';
      } else {
        backToTop.style.opacity = '0';
      }
    });
    
    backToTop.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Comprehensive search functionality using server-side generated index
  function initSearch() {
    var searchInput = document.getElementById('search-input');
    var searchClear = document.getElementById('search-clear');
    var searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;

    // Use server-side generated search data
    var searchIndex = window.blogSearchData || [];

    // Build search index from current page if server data not available
    if (searchIndex.length === 0) {
      var postsContainer = document.getElementById('posts-container');
      if (postsContainer) {
        var postElements = postsContainer.querySelectorAll('.post-type-compact');
        postElements.forEach(function(postEl) {
          var title = postEl.querySelector('.post-title-link').textContent.trim();
          var url = postEl.querySelector('.post-title-link').href;
          var excerpt = postEl.querySelector('.post-excerpt').textContent.trim();
          var date = postEl.querySelector('.post-date').textContent.trim();
          
          var categories = [];
          var categoryTags = postEl.querySelectorAll('.category-tag');
          categoryTags.forEach(function(tag) {
            categories.push(tag.textContent.trim());
          });
          
          var tags = [];
          var tagElements = postEl.querySelectorAll('.tag');
          tagElements.forEach(function(tag) {
            tags.push(tag.textContent.replace('#', '').trim());
          });
          
          searchIndex.push({
            title: title,
            url: url,
            content: excerpt,
            date: date,
            categories: categories,
            tags: tags
          });
        });
      }
    }

    // Search through all posts
    function searchPosts(query) {
      if (!query.trim()) return [];

      var searchTerms = query.toLowerCase().split(/\s+/);
      
      return searchIndex.filter(function(post) {
        var searchableText = (post.title + ' ' + 
                             post.content + ' ' + 
                             (post.categories || []).join(' ') + ' ' + 
                             (post.tags || []).join(' ')).toLowerCase();
        
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
      searchResults.innerHTML = '';
      
      if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-no-results">没有找到相关文章</div>';
      } else {
        results.forEach(function(result) {
          var item = document.createElement('div');
          item.className = 'search-result-item';
          
          var highlightedTitle = highlightText(result.title, query);
          var highlightedExcerpt = highlightText(
            result.content.substring(0, 150) + (result.content.length > 150 ? '...' : ''),
            query
          );
          
          item.innerHTML = `
            <div class="search-result-title">${highlightedTitle}</div>
            <div class="search-result-excerpt">${highlightedExcerpt}</div>
            <div class="search-result-meta">
              <span>${result.date}</span>
              ${result.categories && result.categories.length ? `<span> · ${result.categories.join(', ')}</span>` : ''}
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

    // Highlight search terms
    function highlightText(text, query) {
      if (!query) return text;
      var regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
      return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Perform comprehensive search
    function performComprehensiveSearch(query) {
      if (!query.trim()) {
        searchResults.style.display = 'none';
        return;
      }

      var results = searchPosts(query);
      displaySearchResults(results, query);
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
  }

  // Initialize all functions
  document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    initSearchToggle();
    initSmoothScroll();
    initBackToTop();
    initSearch();
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    var sidebar = document.querySelector('#sidebar');
    var container = document.querySelector('#container');
    
    if (window.innerWidth > 768) {
      sidebar.classList.remove('sidebar-active');
      container.classList.remove('sidebar-active');
    }
  });

})();
