function orgChartLink(scope, element, attr, ctrl) {
	var chart = ctrl.chart;
	var container = element[0].querySelector(".org-chart-container");

	render();

	function render() {
		var forest;
		var summary;

		container.innerHTML = "";

		if (!chart.roots.length) {
			container.appendChild(makeEmptyState());
			return;
		}

		summary = makeDom("p", "org-chart-summary");
		summary.textContent = chart.totalDepartments + " " + (chart.totalDepartments === 1 ? chart.i18n.department : chart.i18n.departments);
		container.appendChild(summary);

		forest = makeDom("div", "department-forest");
		chart.roots.forEach(function(root) {
			forest.appendChild(makeTree(root));
		});

		container.appendChild(forest);
	}

	function makeEmptyState() {
		var empty = makeDom("p", "org-chart-empty");
		empty.textContent = chart.i18n.noDepartments;
		return empty;
	}

	function makeTree(department) {
		var node = makeDom("div", "department-node");
		var children = department.children || [];

		node.appendChild(makeCard(department));

		if (children.length) {
			var childContainer = makeDom("div", "department-children");
			var childRow = makeDom("div", "department-row");

			if (children.length > 1)
				childContainer.classList.add("multi-child");

			children.forEach(function(child) {
				var childWrapper = makeDom("div", "department-child");
				childWrapper.appendChild(makeTree(child));
				childRow.appendChild(childWrapper);
			});

			childContainer.appendChild(childRow);
			node.appendChild(childContainer);
		}

		return node;
	}

	function makeCard(department) {
		var card = makeDom("div", "card department-card");
		var cardContainer = makeDom("div", "card-container");
		var avatar = makeAvatar(department);

		card.appendChild(cardContainer);
		cardContainer.appendChild(avatar);
		appendSimpleLine(cardContainer, "name", department.name.display_value);
		appendSimpleLine(cardContainer, "department-parent", department.parentText);
		appendMetaLine(cardContainer, chart.i18n.parent, department.parent.display_value || chart.i18n.topLevelDepartment);
		appendMetaLine(cardContainer, chart.i18n.directChildren, department.childCount.toString());

		return card;
	}

	function makeAvatar(department) {
		var avatar = makeDom("div", "avatar");
		var badge = makeDom("span", "report-badge");
		var initial = makeDom("span", "view-profile");

		initial.textContent = department.initial;
		initial.setAttribute("aria-hidden", "true");
		avatar.appendChild(initial);

		if (department.childCount) {
			badge.textContent = department.childCount;
			badge.setAttribute("aria-hidden", "true");
			avatar.appendChild(badge);
		}

		return avatar;
	}

	function appendSimpleLine(container, className, value) {
		var p = makeDom("p", className);
		var span = makeDom("span");

		span.textContent = value;
		p.appendChild(span);
		container.appendChild(p);
	}

	function appendMetaLine(container, labelText, valueText) {
		var p = makeDom("p", "department-meta");
		var label = makeDom("label");
		var span = makeDom("span");

		label.textContent = labelText;
		span.textContent = valueText;

		p.appendChild(label);
		p.appendChild(span);
		container.appendChild(p);
	}

	function makeDom(tag, className) {
		var el = document.createElement(tag);

		if (className)
			el.className = className;

		return el;
	}
}
