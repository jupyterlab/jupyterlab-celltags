import { Cell } from "@jupyterlab/cells";

export function write_tag(cell: Cell, name: string, add: boolean) {
  /* If add = true, check if tags are undefined; if so, initialize the array.
    Otherwise, check if the tag already exists; if so, return false.
    Then add the tag to metadata.tags. */
  if (name === "") {
    //do nothing if tag is a blank string - can't add or remove
    return;
  } else if (add) {
    // Add to metadata
    let wtaglist = cell.model.metadata.get("tags") as string[];
    let new_tags = preprocess_input(name);
    if (wtaglist === undefined) {
      wtaglist = [];
    } else {
      if (new_tags.length === 1 && wtaglist.indexOf(new_tags[0]) !== -1) {
        return false;
      }
    }
    const to_add: string[] = [];
    for (let tag = 0; tag < new_tags.length; tag++) {
      if (new_tags[tag] !== "" && !contains_tag(new_tags[tag], to_add)) {
        to_add.push(new_tags[tag]);
      }
    }
    const new_list: string[] = [];
    for (let i = 0; i < wtaglist.length; i++) {
      new_list.push(wtaglist[i]);
    }
    for (let j = 0; j < to_add.length; j++) {
      if (!contains_tag(to_add[j], new_list)) {
        new_list.push(to_add[j]);
      }
    }
    cell.model.metadata.set("tags", new_list);
    /* If add = false, try to remove from metadata. First check if metadata and 
      metadata.tags exist; if not, return false. Then remove the tag and remove
      metadata.tags if it is empty.*/
  } else {
    // Remove from metadata
    if (!cell.model.metadata || !cell.model.metadata.get("tags")) {
      // No tags to remove
      return false;
    }
    // Remove tag from tags list
    let rtaglist = cell.model.metadata.get("tags") as string[];
    var new_list: string[] = [];
    for (var i = 0; i < rtaglist.length; i++) {
      if (rtaglist[i] != name) {
        new_list.push(rtaglist[i]);
      }
    }
    cell.model.metadata.set("tags", new_list);
    // If tags list is empty, remove it
    let updated = cell.model.metadata.get("tags") as string[];
    if (updated.length === 0) {
      cell.model.metadata.delete("tags");
    }
  }
  //cell.events.trigger('set_dirty.Notebook', {value: true});
  return true;
}

export function preprocess_input(input: string) {
  // Split on whitespace + commas:
  return input.split(/[,\s]+/);
}

export function cleanup_metadata(cell: Cell) {
  let taglist = <string[]>cell.model.metadata.get("tags");
  var results: string[] = [];
  if (taglist === undefined) {
    return;
  }
  for (let i = taglist.length - 1; i >= 0; i--) {
    var found = false;
    for (let j = 0; j < i; j++) {
      if (taglist[j] === taglist[i]) {
        found = true;
        break;
      }
    }
    if (!found) {
      results.push(taglist[i]);
    }
  }
  cell.model.metadata.set("tags", results.reverse());
}

function contains_tag(tag: string, taglist: string[]) {
  for (var i = 0; i < taglist.length; i++) {
    if (taglist[i] === tag) {
      return true;
    }
  }
  return false;
}
