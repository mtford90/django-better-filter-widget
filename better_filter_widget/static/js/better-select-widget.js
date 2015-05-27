// startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.lastIndexOf(searchString, position) === position;
  };
}

function BetterSelectWidget(field_name) {

  console.log('BetterSelectWidget', field_name);


  function deselectItem() {
    var item = $(this);
    var id = item.data('id');
    orig_input.find('option[value=' + id + ']').removeAttr('selected');
    available_items.find('[data-id=' + id + ']').removeClass('selected');

    // Doesn't trigger change event for some reason (maybe because display: none?)
    $(orig_input).trigger('change');
  }

  function selectItem() {
    var selected_item = $(this);
    var selected_id = selected_item.data('id');
    available_items.find('.selected').removeClass('selected');
    selected_item.addClass('selected');

    orig_input
      .find('option[selected="selected"]')
      .removeAttr('selected');

    orig_input
      .find('option[value=' + selected_id + ']')
      .attr('selected', 'selected');

    $selected_item
      .text(selected_item.text());

    // Doesn't trigger change event for some reason (maybe because display: none?)
    $(orig_input).trigger('change');
  }

  function clickItem() {
    var selected_item = $(this);
    if (selected_item.hasClass('selected')) {
      deselectItem.call(this);
    }
    else {
      selectItem.call(this);
    }
  }

  $ = django.jQuery;
  var sbfw_wrap;
  var $selected_item = $('<div class="item selected-item">Poop</div>');
  var orig_input = $('#id_' + field_name);
  var available_items = $('<div id="available_' + field_name + '" class="item-list available-items"/>');
  var filter_input = $('<input class="item-filter" type="text" placeholder="type to filter..."/>');
  var item_count = 0;
  orig_input.parent().children().hide();
  $('label[for=id_' + field_name + ']').show();
  sbfw_wrap = $('<div/>');
  var available_items_wrap = $('<div class="available-items-wrap items-wrap"/>');
  orig_input.parent().append(sbfw_wrap);
  sbfw_wrap.addClass('sbfw');
  available_items_wrap.append($('<div class="title title-available">Available</div>'));
  available_items_wrap.append(filter_input);
  available_items_wrap.append(available_items);
  available_items_wrap.append($('<div class="title title-selected">Selected</div>'));
  available_items_wrap.append($selected_item);
  sbfw_wrap.append(available_items_wrap);

  /**
   * Use the original input to recreate the items.
   */
  function recreateItems() {

    var selected;

    orig_input
      .find('option')
      .each(function (i, opt) {
        opt = $(opt);
        var $item = $('<div class="item item-available" data-id="' + opt.attr('value') + '">'
          + opt.text() + '</div>');
        if (opt.is(':selected')) {
          $item.addClass('selected');
          $selected_item.text($item.text());
          selected = $item[0];
        }
        available_items.append($item);
        $item.click(clickItem);
        item_count++;
      });

    // Scroll to the selected item.
    if (selected) {
      available_items[0].scrollTop = selected.offsetTop - 83;
    }
  }

  recreateItems();

  var last_filter;
  var search_timeout;

  filter_input.keyup(function () {
    var filter = filter_input.val().toLowerCase();
    var sel = '.item';
    var match_count = 0;

    if (filter == last_filter) return;
    if (filter.indexOf(last_filter) === 0) sel += ':visible';
    last_filter = filter;
    var items = available_items.find(sel);

    var delay = item_count > 3000 ? (filter.length == 1 ? 300 : 100) : 1;
    clearTimeout(search_timeout);
    search_timeout = setTimeout(function () {
      items.each(function (i, opt) {
        opt = $(opt);
        var match = opt.text().toLowerCase().startsWith(filter);
        opt.attr('style', 'display:' + (match ? 'block' : 'none'));
        match_count += match ? 1 : 0;
      });
    }, delay);
  });

}
