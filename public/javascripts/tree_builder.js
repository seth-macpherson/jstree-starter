/* 

1.) load tree || create root node

2.) process node metadata and inject element attributes as necessary - 
  build_node {
    id: {default: null}, 
    type: {default: root}
    label: label_for(type)
    icon: icons_for(type),
    buttons : buttons_for(type)
  }
3.) define hover events
  a.) show button array on hover
  b.) then hide
*/

/*
  MOCK & TEST DATA
*/

var submission_type_id = 12345;

$(document).ready(function() {
  $.ajax = function(params){
    if(params.url === "/person/1"){
       params.success({}); //return the data you need
    }
  }
});


$(function () {
  
  // instance variables
  var NODE_TYPES = ['root','if','else', ,'predicate','when','action'];

  function locked_and_loaded() {
    // Fail hard and fail fast if the required variables aren't defined
    if (typeof(submission_type_id) === 'undefined' || !submission_type_id) {
      console.error("Workflow Builder Aborted: submission_type_id is undefined");
      return false;
    } else if (typeof($.jstree) === 'undefined') {
      console.error("Workflow Builder Aborted: jquery.jstree.js file has not loaded");
      return false;
    }
    console.info("Workflow Builder Ready");
    return true;
  }

  function load_workflow(id) {
    return;
  }
  
  function get_fields(submission_type_id) {
    // body...
  }

  function static_elements() {
    // append elements to body we're going to need
    $("<div id='tree_button_group' />").appendTo("body");
    // create all icons
    build_icons(NODE_TYPES);
  }
  
  function config_ajax(tree) {
    tree.ajaxError(function() {
      $(this).text("Triggered ajaxError handler.");
    });
    $.ajaxSetup({
       type: "GET",
       url: "/workflow_templates/available_condition_fields"
     });
  }
  
  function load_tree_data() {
    // if a workflow_template_id has been defined then load the tree via ajax, otherwise we've got a new tree to build
    return ((typeof(workflow_template_id) !== 'undefined') ? load_workflow(workflow_template_id) : build_node("root"));
  }

  function initialize() {
    // cache a reference to the top-most element since we're going to reference it constantly
    var workflow = $("#tree-pane");

    // setup methods
    static_elements();
    config_ajax(workflow);
    
    // configure tree
    var config = {
      "core" : {
        "animation" : 0,
        "html_titles" : true
      },
      "ui" : {
        "select_limit" : 1
      },
      "themes" : {
        "theme" : "apple"
      },
      "plugins" : [
        "json_data","ui","crrm","types","themes" //,"themeroller" "contextmenu"
      ],
    	"json_data" : {
  			data : load_tree_data()
  		},
  		"types" : {
        // "valid_children" : [ "root" ],
  			"types" : {
  				"root" : {
  					"icon" : { 
  						"image" : "http://static.jstree.com/v.1.0rc/_docs/_drive.png" 
  					},
          }
            // "valid_children" : [ "if","else" ] //,
            // "max_depth" : 2,
            // "hover_node" : false,
            // "select_node" : function () {return false;}
          // },
          // "if" : {
          //   "valid_children" : [ "if","else" ]
          // },
          // "else" : {
          //   "valid_children" : [ "if" ]
          // }
  			}
  		}
    };

    // initialize new tree object by setting up bind events first
    // then finish by loading config data, thus creating the tree
    workflow.bind("loaded.jstree", function (e, data) {
      // console.info("tree loaded");
    // }).bind("select_node.jstree", function (e, data) { 
      // console.log("select_node");
      // console.log(data.rslt.obj); 
    }).bind("dehover_node.jstree", function (e, data) { 
      // $(data.rslt.obj).removeClass('hover');
    }).bind("hover_node.jstree", function (e, data) { 
      workflow.jstree("select_node",data.rslt.obj,true);
      // $(data.rslt.obj).addClass('hover');
    }).bind("create_node.jstree", function (e, data) { 
      // console.log("create_node"); 
      // console.log(data.rslt.obj); 
    }).jstree(config);
  
    // more efficient than the bind methods... 
    // TODO - convert bind() to delegate()
  	workflow.delegate("button",'click', function (e) { 
      // console.log(arguments);
      var selected,
          target = $(e.target),
          nodeParams = {},
          type,label;
          e.stopPropagation();
      selected = workflow.jstree("get_selected");
      type = target.attr('data-type');
      // label = type + " created";
      console.log("type:" + type);
      // console.log("label:" + label);
                  // ("create", node , position , js , callback , skip_rename )
      workflow.jstree("create", null, false, build_node(type), false, true);
      // if(target.is(":button.clause")) {
      //   type = "clause";
      //   console.log(" add a clause block ");
      // } else if(target.is(":button.predicate")) {
      //   type = "predicate";
      //   console.log(" add a predicate block ");
      // } else if(target.is(":button.else")) {
      //   type = "else";
      // }

  	});

    workflow.jstree("set_theme","apple");

  }

  function build_node(type,label) {
    var row = [];
    row.push(label || build_label(type,submission_type_id));
    row.push(buttons_for(type));
    row.push(icon_for(type));
    return {attr : {rel: type, id: 'node_' + Math.random()}, data: row.join('') };
  }
  
  function build_label(submission_type_id) {
    $.ajax({
      data: {'submission_type_id': submission_type_id},
      success: function(){
        console.info("ajax success");
        console.log(arguments);
      }
    });
  }
  
  function build_icons(types) {
    $(types).each(function(idx,type) {
      $("<span/>").attr({
        'class': 'icon ' + type,
        'id'   : 'jstree-' + type + '-icon'}
      ).appendTo("body").hide();
    });
  }
  
  function icon_for(type) {
    return $('#jstree-' + type + '-icon').html();
  }
  
  function buttons_for(type) {
    var button_group = $('#tree_button_group').clone().attr({
      "id": null,
      "class" : "buttons"
    });
    var buttons = [];
    // "type" isn't probably as accurate as parent_node_type
    // consider a refactor
    switch(type.toLowerCase()) {
      case "root": 
        build_button({
          "data-type" : "else",
          "class" : "else"
        }, "Else").appendTo(button_group);
        build_button({
          "data-type" : "if",
          "class" : "if"
        }, "If/When").appendTo(button_group);
      break;
      case "if": case "else": case "predicate": case "action":
        build_button({
          "data-type" : "action",
          "class" : "action"
        }, "Add Action").appendTo(button_group);
        build_button({
          "data-type" : "else",
          "class" : "else"
        }, "Else").appendTo(button_group);
        build_button({
          "data-type" : "if",
          "class" : "if"
        }, "If/When").appendTo(button_group);
      break;
      default:
        console.error("An unknown type was specified to buttons_for(" + type + ")");
    }
    // console.log(button_group.html());
    return button_group.html();
  }
  
  function build_button(config,text) {
    return $('<button/>').attr(config).text(text);
  }

  // $("#wf-menu input").click(function () {
  //   switch(this.id) {
  //     case "add_default":
  //     case "add_folder":
  //       tree.jstree("create", null, "last", { "attr" : { "rel" : this.id.toString().replace("add_", "") } });
  //       break;
  //     case "text": break;
  //     default:
  //         console.log("uncaptured event:" + this.id);
  //       break;
  //   }
  // });

  // Okay, go!
  if (locked_and_loaded()) {
    initialize();
  }

});
