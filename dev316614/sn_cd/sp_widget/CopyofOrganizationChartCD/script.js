data.orgChart = data.orgChart || {};
data.orgChart.roots = [];
data.orgChart.totalDepartments = 0;
data.orgChart.i18n = {
	department: gs.getMessage("department"),
	departments: gs.getMessage("departments"),
	directChildren: gs.getMessage("Direct child departments"),
	noDepartments: gs.getMessage("No departments found"),
	parent: gs.getMessage("Parent"),
	topLevelDepartment: gs.getMessage("Top-level department")
};

buildDepartmentTree();

function addActiveQueryIfPresent(gr) {
	if (gr.isValidField("active"))
		gr.addActiveQuery();
}

function buildDepartmentTree() {
	var gr = new GlideRecordSecure("cmn_department");
	var nodes = {};
	var orderedIds = [];

	addActiveQueryIfPresent(gr);
	gr.orderBy("name");
	gr.query();

	while (gr.next()) {
		if (!gr.canRead())
			continue;

		nodes[gr.getUniqueValue()] = getDepartmentData(gr);
		orderedIds.push(gr.getUniqueValue());
	}

	orderedIds.forEach(function(sysId) {
		var department = nodes[sysId];
		var parentId = department.parent.value;

		if (parentId && nodes[parentId])
			nodes[parentId].children.push(department);
		else
			data.orgChart.roots.push(department);
	});

	data.orgChart.totalDepartments = orderedIds.length;
	populateMetadata(data.orgChart.roots);
}

function populateMetadata(departments) {
	departments.forEach(function(department) {
		department.childCount = department.children.length;
		department.childCountText = department.childCount === 1 ?
			gs.getMessage("{0} direct child department", "1") :
			gs.getMessage("{0} direct child departments", department.childCount.toString());
		department.parentText = department.parent.display_value || data.orgChart.i18n.topLevelDepartment;

		if (department.children.length)
			populateMetadata(department.children);
	});
}

function getFieldValueAndMetadata(gr, fieldName) {
	var ge = gr.getElement(fieldName);
	return {
		display_value: ge ? ge.getDisplayValue() : "",
		label: ge ? ge.getLabel() : "",
		value: ge ? ge.toString() : "",
		type: ge ? ge.getED().getInternalType() : ""
	};
}

function getDepartmentInitial(gr) {
	var initial = (gr.getDisplayValue("name") || "").trim();
	var cutOff = 3;
	var matches;

	if (!initial)
		return "--";

	if (/[^\u0000-\u007F]/.test(initial))
		cutOff = 2;
	else
		initial = initial.replace(/\W[\w\s]+\W(?!\w)|[^a-z\s]/gi, "");

	matches = initial.match(/[^\u0000-\u007F]+|\b[a-z]/gi);
	initial = matches ? matches.join("") : initial.substring(0, cutOff);

	return initial.length > cutOff ? initial.substr(0, cutOff) : initial;
}

function getDepartmentData(gr) {
	return {
		sys_id: getFieldValueAndMetadata(gr, "sys_id"),
		name: getFieldValueAndMetadata(gr, "name"),
		parent: getFieldValueAndMetadata(gr, "parent"),
		initial: getDepartmentInitial(gr),
		children: []
	};
}
