var getCardWidth, horizontalBlockHelpers, scrollSnap, throttledResize, typeHelpers, updatecurrentY,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

getCardWidth = function(windowWidth) {
  var cardWidth;
  if (windowWidth <= 1024) {
    return cardWidth = 400;
  } else if ((windowWidth > 1024) && (windowWidth <= 1304)) {
    return cardWidth = (windowWidth - (16 * 3) - (88 * 2)) / 2;
  } else {
    return cardWidth = 520;
  }
};

Session.set("windowHeight", $(window).height());

Session.set("separation", 10);

Session.set("width", window.outerWidth);

Session.set("cardWidth", getCardWidth(Session.get("width")));

throttledResize = _.throttle(function() {
  if (window.outerWidth > 1024) {
    Session.set("resize", new Date());
    Session.set("width", window.outerWidth);
    return Session.set("cardWidth", getCardWidth(Session.get("width")));
  }
}, 5);

$(window).resize(throttledResize);

scrollSnap = function() {
  var height, i, scrollTop, tolerance, verticalHeights, _i, _len, _results;
  scrollTop = $(document).scrollTop();
  Session.set("scrollTop", scrollTop);
  verticalHeights = window.getVerticalHeights();
  tolerance = 20;
  _results = [];
  for (i = _i = 0, _len = verticalHeights.length; _i < _len; i = ++_i) {
    height = verticalHeights[i];
    if (((height - tolerance) < scrollTop) && (scrollTop < (height + tolerance))) {
      console.log(scrollTop, i);
      _results.push(goToY(i));
    } else {
      _results.push(void 0);
    }
  }
  return _results;
};

updatecurrentY = function() {
  var actualY, h, i, maxScroll, readMode, scrollTop, stickyBody, stickyTitle, vertTop, _i, _len, _ref;
  scrollTop = $(document).scrollTop();
  Session.set("scrollTop", scrollTop);
  if (scrollTop >= (200 - 32)) {
    Session.set("sticky", true);
  } else {
    Session.set("sticky", false);
  }
  stickyBody = 90;
  stickyTitle = 120;
  maxScroll = 230;
  readMode = 250;
  $("div#banner-overlay").css({
    opacity: Math.min(1.0, scrollTop / maxScroll)
  });
  $("article.content").css({
    opacity: 0.5 + Math.min(1.0, scrollTop / maxScroll) / 2
  });
  if (scrollTop >= stickyTitle) {
    $("div.title-author").css({
      "margin-top": "0px"
    });
    $("div.title-author").addClass("fixed");
  } else {
    $("div.title-author").css({
      "margin-top": "125px"
    });
    $("div.title-author").removeClass("fixed");
  }
  if (scrollTop >= stickyBody) {
    vertTop = 427 + scrollTop - stickyTitle;
    $("div.horizontal-context").addClass("fixed");
    $("div.vertical-narrative").css({
      top: vertTop
    });
    if (scrollTop >= maxScroll) {
      $("div.vertical-narrative").css({
        top: 557
      });
    }
  } else {
    $("div.vertical-narrative").css({
      top: 427
    });
    $("div.horizontal-context").removeClass("fixed");
  }
  if (scrollTop >= maxScroll) {
    $("div.title-overlay, div#banner-overlay").addClass("fixed");
    $("div.logo").addClass("visible");
  } else {
    $("div.title-overlay, div#banner-overlay").removeClass("fixed");
    $("div.logo").removeClass("visible");
  }
  if (scrollTop >= readMode) {
    Session.set("pastHeader", true);
    _ref = window.getVerticalHeights();
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      h = _ref[i];
      if (scrollTop < h) {
        break;
      }
    }
    actualY = i - 1;
    if (Session.get('currentY') !== actualY) {
      Session.set("currentX", 0);
      return Session.set("currentY", actualY);
    }
  } else {
    return Session.set("pastHeader", false);
  }
};

Meteor.startup(function() {
  var throttledUpdate;
  Session.setDefault("filterOpen", false);
  Session.setDefault("filter", "curated");
  Session.setDefault("category", "all");
  Session.setDefault("pastY", []);
  Session.setDefault("pastX", []);
  Session.setDefault("currentY", void 0);
  Session.setDefault("currentX", void 0);
  throttledUpdate = _.throttle(updatecurrentY, 20);
  return $(document).scroll(throttledUpdate);
});

Template.story_header.rendered = function() {
  var range, sel, titleDiv;
  if (!this.data.title) {
    if (!Session.get('read')) {
      titleDiv = $(this)[0].find('.title');
      sel = window.getSelection();
      if (sel.rangeCount > 0) {
        sel.removeAllRanges();
      }
      range = document.createRange();
      range.selectNodeContents(titleDiv);
      range.collapse();
      return sel.addRange(range);
    }
  }
};

Template.story_header.helpers({
  title: function() {
    if (this.title) {
      return this.title;
    } else {
      return Session.get("storyTitle");
    }
  },
  headerImageAttribution: function() {
    return this.headerImageAttribution;
  },
  backgroundImage: function() {
    if (this.backgroundImage) {
      return this.backgroundImage;
    } else {
      return Session.get("backgroundImage");
    }
  }
});

Template.story_header.events = {
  "mouseover #banner-overlay, mouseover #to-header": function() {
    if (Session.get('pastHeader')) {
      return $("#to-header").addClass('shown');
    }
  },
  "mouseout #banner-overlay": function() {
    if (Session.get('pastHeader')) {
      return $("#to-header").removeClass('shown');
    }
  },
  "click #to-story": function() {
    $('#to-story, .attribution').fadeOut();
    goToX(0);
    return goToY(0);
  },
  "click #banner-overlay": function() {
    var path;
    if (Session.get("pastHeader")) {
      $("#to-header").removeClass("shown");
      $("html, body").animate({
        scrollTop: 0
      }, function() {
        return $('#to-story, .attribution').fadeIn();
      });
      Session.set("currentX", void 0);
      Session.set("currentY", void 0);
      path = window.location.pathname.split("/");
      path.pop();
      return path.pop();
    } else {
      $('#to-story, .attribution').fadeOut();
      goToX(0);
      return goToY(0);
    }
  },
  "click #to-header": function() {
    var path;
    $("#to-header").removeClass("shown");
    $("html, body").animate({
      scrollTop: 0
    }, function() {
      return $('#to-story, .attribution').fadeIn();
    });
    Session.set("currentX", void 0);
    Session.set("currentY", void 0);
    path = window.location.pathname.split("/");
    path.pop();
    return path.pop();
  }
};

Template.story.events = {
  "click .link": function(d) {
    var srcE, x, y;
    srcE = d.srcElement ? d.srcElement : d.target;
    x = $(srcE).data("x");
    y = $(srcE).data("y");
    return goToXY(x, y);
  },
  "click a": function(e) {
    var contextId;
    e.preventDefault();
    contextId = $(e.target).attr('href').slice(1);
    return goToContext(contextId);
  },
  "keydown": function(d) {
    if (Session.get("read")) {
      if (d.keyCode === 38) {
        return goToY(Session.get("currentY") - 1);
      } else if (d.keyCode === 40) {
        return goToY(Session.get("currentY") + 1);
      } else if (d.keyCode === 39) {

      } else if (d.keyCode === 37) {

      }
    }
  }
};

Template.story.helpers({
  horizontalExists: function() {
    var currentY, _ref;
    currentY = Session.get('currentY');
    return ((_ref = Session.get('horizontalSectionsMap')[currentY]) != null ? _ref.horizontal.length : void 0) > 1;
  },
  pastHeader: function() {
    return Session.get("pastHeader");
  },
  verticalLeft: function() {
    var width;
    width = Session.get("width");
    if (width <= 1304) {
      return 88 + 16;
    } else {
      return (width / 2) - (Session.get("separation") / 2) - Session.get("cardWidth");
    }
  },
  verticalLeft: function() {
    var width;
    width = Session.get("width");
    if (Session.get("narrativeView")) {
      return (width - 800) / 2;
    }
    if (width <= 1304) {
      return 88 + 16;
    } else {
      return (width / 2) - (Session.get("separation") / 2) - Session.get("cardWidth");
    }
  },
  spacerHeight: function() {
    return Session.get("windowHeight") - 230 - 300;
  }
});

Template.vertical_section_block.helpers({
  notFirst: function() {
    return !Session.equals("currentY", 0);
  },
  verticalSelected: function() {
    return Session.equals("currentY", this.index) && Session.get("pastHeader");
  },
  validTitle: function() {
    return this.title === !"title";
  },
  contentDiv: function() {
    if (Session.get('read')) {
      return '<div class="content">' + this.content + '</div>';
    } else {
      return '<div class="content editable fold-editable" placeholder="Type your text here." contenteditable="true">' + this.content + '</div>';
    }
  }
});

Template.vertical_narrative.helpers({
  verticalSectionsWithIndex: function() {
    return this.verticalSections.map(function(v, i) {
      return _.extend(v, {
        index: i
      });
    });
  }
});

Template.vertical_narrative.events({
  "click section": function(d) {
    var i, srcE;
    $('#to-story, .attribution').fadeOut();
    srcE = d.srcElement ? d.srcElement : d.target;
    i = $(srcE).data('vertical-index');
    if (i == null) {
      i = $(srcE).closest('section').data('vertical-index');
    }
    if (i != null) {
      if (i !== Session.get("currentY")) {
        goToX(0);
        return goToY(i);
      }
    }
  }
});

Template.minimap.helpers({
  horizontalSectionsMap: function() {
    return Session.get("horizontalSectionsMap");
  },
  selectedX: function() {
    return Session.equals("currentX", this.horizontalIndex);
  },
  selectedY: function() {
    return Session.equals("currentY", this.verticalIndex);
  }
});

Template.horizontal_context.helpers({
  verticalExists: function() {
    return Session.get("horizontalSectionsMap").length;
  },
  horizontalSections: function() {
    return this.verticalSections.map(function(verticalSection, verticalIndex) {
      var sortedContext, unsortedContext;
      unsortedContext = ContextBlocks.find({
        _id: {
          $in: verticalSection.contextBlocks
        }
      }).map(function(datum) {
        var horizontalIndex;
        horizontalIndex = verticalSection.contextBlocks.indexOf(datum._id);
        return _.extend(datum, {
          index: horizontalIndex
        });
      });
      sortedContext = _.sortBy(unsortedContext, function(datum) {
        return datum.horizontalIndex;
      });
      return {
        index: verticalIndex,
        data: sortedContext
      };
    });
  },
  last: function() {
    var lastIndex, _ref;
    lastIndex = ((_ref = Session.get("horizontalSectionsMap")[Session.get("currentY")]) != null ? _ref.horizontal.length : void 0) - 1;
    return (this.index === lastIndex) && (lastIndex > 0);
  },
  horizontalShown: function() {
    return Session.equals("currentY", this.index);
  }
});

typeHelpers = {
  text: function() {
    return this.type === "text";
  },
  image: function() {
    return this.type === "image";
  },
  map: function() {
    return this.type === "map";
  },
  video: function() {
    return this.type === "video";
  },
  oec: function() {
    return this.type === "oec";
  }
};

horizontalBlockHelpers = _.extend({}, typeHelpers, {
  selected: function() {
    return Session.equals("currentX", this.index) && !Session.get("addingContextToCurrentY");
  }
});

Template.horizontal_section_block.helpers(horizontalBlockHelpers);

Template.horizontal_section_block.helpers({
  left: function() {
    var adjustedIndex, cardWidth, currentX, halfWidth, horizontalLength, lastIndex, left, offset, read, width;
    width = Session.get("width");
    if (width < 1024) {
      width = 1024;
    }
    halfWidth = width / 2;
    cardWidth = Session.get("cardWidth");
    read = Session.get("read");
    if (read) {
      offset = 0;
    } else {
      offset = 75 + Session.get("separation");
    }
    if (Session.get("addingContextToCurrentY")) {
      offset += cardWidth + Session.get("separation");
    }
    horizontalLength = Session.get("horizontalSectionsMap")[Session.get("currentY")].horizontal.length;
    lastIndex = horizontalLength - 1;
    currentX = Session.get("currentX");
    adjustedIndex = this.index - currentX;
    if (adjustedIndex < 0) {
      adjustedIndex = horizontalLength + adjustedIndex;
    }
    if ((lastIndex >= 2) && (adjustedIndex === lastIndex)) {
      if (width <= 1304) {
        left = (-cardWidth + 88) + offset;
      } else {
        left = -Session.get("cardWidth") + (width - (Session.get("separation") * 3) - (Session.get("cardWidth") * 2)) / 2;
      }
    } else if (adjustedIndex) {
      left = (adjustedIndex * cardWidth) + halfWidth + (3 * (Session.get("separation")) / 2) + offset;
    } else {
      left = halfWidth + ((Session.get("separation")) / 2) + offset;
    }
    return left;
  },
  lastUpdate: function() {
    Session.get('lastUpdate');
  }
});

Template.display_oec_section.helpers(horizontalBlockHelpers);

Template.display_video_section.helpers(horizontalBlockHelpers);

Template.display_map_section.helpers(horizontalBlockHelpers);

Template.horizontal_section_edit_delete.helpers(horizontalBlockHelpers);


Template.story_browser.events({
  "click .right": function(d) {
    var currentX, horizontalSection, newX, path;
    horizontalSection = Session.get("horizontalSectionsMap")[Session.get("currentY")].horizontal;
    currentX = Session.get("currentX");
    newX = currentX === (horizontalSection.length - 1) ? 0 : currentX + 1;
    goToX(newX);
    Session.set("currentX", newX);
    path = window.location.pathname.split("/");
    return path[4] = Session.get("currentX");
  },
  "click .left": function(d) {
    var currentX, horizontalSection, newX, path;
    horizontalSection = Session.get("horizontalSectionsMap")[Session.get("currentY")].horizontal;
    currentX = Session.get("currentX");
    newX = currentX ? currentX - 1 : horizontalSection.length - 1;
    Session.set("currentX", newX);
    path = window.location.pathname.split("/");
    return path[4] = Session.get("currentX");
  }
});

Template.type_specific_icon.helpers(typeHelpers);

Template.favorite_button.helpers({
  userFavorited: function() {
    var _ref;
    return Meteor.user() && (_ref = Meteor.user()._id, __indexOf.call(this.favorited, _ref) >= 0);
  }
});

Template.favorite_button.events({
  "click .favorite": function() {
    return Meteor.call('favoriteStory', this._id, function(err) {
      if (err) {
        return alert(err);
      }
    });
  },
  "click .unfavorite": function() {
    return Meteor.call('unfavoriteStory', this._id, function(err) {
      if (err) {
        return alert(err);
      }
    });
  }
});
