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
		var card = makeDom("a", "card department-card");
		var cardContainer = makeDom("div", "card-container");

		card.setAttribute("href", buildDepartmentSearchUrl(department));
		card.setAttribute("aria-label", "Open colleague search for " + department.name.display_value);
		card.appendChild(cardContainer);
		appendSimpleLine(cardContainer, "name", department.name.display_value);
		appendSimpleLine(cardContainer, "department-level", department.levelText);
		appendSimpleLine(cardContainer, "department-description", department.description.display_value || department.description.value);

		return card;
	}

	function buildDepartmentSearchUrl(department) {
		var query = encodeURIComponent(department.name.display_value || "");
		return "/orkla?id=user_profile_clone&search=" + query;
	}

	function appendSimpleLine(container, className, value) {
		if (!value)
			return;

		var p = makeDom("p", className);
		var span = makeDom("span");

		span.textContent = value;
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
