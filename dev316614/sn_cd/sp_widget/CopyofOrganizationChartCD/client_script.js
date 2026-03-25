function orgChartController($scope) {
	var c = this;

	c.chart = {
		i18n: $scope.data.orgChart.i18n || {},
		roots: $scope.data.orgChart.roots || [],
		totalDepartments: $scope.data.orgChart.totalDepartments || 0
	};
}
