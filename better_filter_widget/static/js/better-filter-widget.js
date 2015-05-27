// startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.lastIndexOf(searchString, position) === position;
  };
}


function BetterFilterWidget(field_name) {

  console.log('BetterFilterWidget', field_name);

  function updateSelectedDisplay() {
    selected_items.html('');
    orig_input.find('option:selected').each(function (i, opt) {
      opt = $(opt);
      var item = $('<div class="item item-selected" data-id="' + opt.attr('value') + '"><span class="action-icon action-icon-minus">-</span>' + opt.text() + '</div>');
      selected_items.append(item);
    });

    available_items.find('.item').click(selectItem);
    bfw_wrap.find('.item-selected').click(deselectItem);
  }

  function deselectItem() {
    var item = $(this);
    var id = item.data('id');
    toast('Removed ' + item.text());
    orig_input.find('option[value=' + id + ']').removeAttr('selected');
    available_items.find('[data-id=' + id + ']').removeClass('selected');
    item.remove();
    updateSelectedDisplay();
  }

  function selectItem() {
    var selected_item = $(this);
    var selected_id = selected_item.data('id');
    selected_item.addClass('selected').hide();
    // if (had_focus) filter_input.focus(); // to bring keyboard back on mobile
    // select item in the hidden input
    orig_input.find('option[value=' + selected_id + ']').attr('selected', 'selected');
    updateSelectedDisplay();
    toast('Added ' + selected_item.text());
  }

  function toast(msg) {
    // Useful for mobile where UI feedback is not great
    $('#bf-toast').html(msg).finish().fadeIn(100).delay(2000).fadeOut(400);
  }

  $ = django.jQuery;
  var bfw_wrap;
  var orig_input = $('#id_' + field_name);
  var available_items = $('<div id="available_' + field_name + '" class="item-list available-items"/>');
  var selected_items = $('<div id="selected_' + field_name + '" class="item-list selected-items"></div>');
  var filter_input = $('<input class="item-filter" type="text" placeholder="type to filter..."/>');
  var item_count = 0;
  // Layout
  // Hide built-in widget stuff
  orig_input.parent().children().hide();
  // but show label
  $('label[for=id_' + field_name + ']').show();
  bfw_wrap = $('<div/>');
  var selected_items_wrap = $('<div class="selected-items-wrap items-wrap"/>');
  var available_items_wrap = $('<div class="available-items-wrap items-wrap"/>');
  orig_input.parent().append(bfw_wrap);
  bfw_wrap.addClass('bfw');
  available_items_wrap.append('<div class="title title-available">Available</div>');
  available_items_wrap.append(filter_input);
  available_items_wrap.append(available_items);
  selected_items_wrap.append('<div class="title title-selected">Selected</div>');
  selected_items_wrap.append(selected_items);
  bfw_wrap.append(available_items_wrap);
  bfw_wrap.append(selected_items_wrap);
  if ($('.bf-toast').length === 0)
    $('body').append('<div id="bf-toast" class="bf-toast"/>');

  // Recreate available list
  orig_input.find('option').each(function (i, opt) {
    opt = $(opt);
    var item = $('<div class="item item-available" data-id="' + opt.attr('value') + '"><span class="action-icon action-icon-plus">+</span>' + opt.text() + '</div>');
    if (opt.is(':selected')) item.addClass('selected');
    available_items.append(item);
    item_count++;
  });


  // update filter
  var last_filter;
  var search_timeout;
  filter_input.keyup(function () {
    var filter = filter_input.val().toLowerCase();
    var sel = '.item';
    var match_count = 0;

    if (filter == last_filter) return;

    // If this filter is just more specific version of last_filter, then we can just search what's visible.
    if (filter.indexOf(last_filter) === 0) sel += ':visible';
    last_filter = filter;
    var items = available_items.find(sel);

    // If more than 3000 items, wait longer before searching
    var delay = item_count > 3000 ? (filter.length == 1 ? 300 : 100) : 1;
    clearTimeout(search_timeout);
    search_timeout = setTimeout(function () {
      // var t = window.performance.now();
      items.each(function (i, opt) {
        opt = $(opt);
        var match = !opt.hasClass('selected') && opt.text().toLowerCase().indexOf(filter) > -1;
        opt.attr('style', 'display:' + (match ? 'block' : 'none'));
        match_count += match ? 1 : 0;
        // if (items.length==i+1) console.log('filter', filter, match_count, window.performance.now()-t );
      });
    }, delay);
    // ^-- first letter is most heavy search and user typically types more than 1 char before stopping.
    // So, increasing timeout here on first search which increases its chance of getting cancelled.
  });

  // init
  updateSelectedDisplay();
}
