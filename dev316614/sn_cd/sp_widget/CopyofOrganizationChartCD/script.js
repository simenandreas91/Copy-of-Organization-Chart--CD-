data.orgChart = data.orgChart || {};
data.orgChart.roots = [];
data.orgChart.totalDepartments = 0;
data.orgChart.i18n = {
	avdeling: gs.getMessage("Avdeling"),
	department: gs.getMessage("department"),
	departments: gs.getMessage("departments"),
	directChildren: gs.getMessage("Direct child departments"),
	gruppeProgram: gs.getMessage("Gruppe/Program"),
	noDepartments: gs.getMessage("No departments found"),
	omrade: gs.getMessage("Område"),
	organizationUnit: gs.getMessage("organisasjonsenhet"),
	organizationUnits: gs.getMessage("organisasjonsenheter"),
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
		department.levelText = getDepartmentLevelText(department.u_level.value);
		department.parentText = department.parent.display_value || data.orgChart.i18n.topLevelDepartment;

		if (department.children.length)
			populateMetadata(department.children);
	});
}

function getDepartmentLevelText(levelValue) {
	switch (levelValue) {
		case "1":
			return data.orgChart.i18n.avdeling;
		case "2":
			return data.orgChart.i18n.omrade;
		case "3":
			return data.orgChart.i18n.gruppeProgram;
		default:
			return "";
	}
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

function getDepartmentData(gr) {
	return {
		description: getFieldValueAndMetadata(gr, "description"),
		id: getFieldValueAndMetadata(gr, "id"),
		sys_id: getFieldValueAndMetadata(gr, "sys_id"),
		name: getFieldValueAndMetadata(gr, "name"),
		parent: getFieldValueAndMetadata(gr, "parent"),
		u_level: getFieldValueAndMetadata(gr, "u_level"),
		children: []
	};
}
