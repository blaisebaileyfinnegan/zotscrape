module.exports = {
	url: 'http://websoc.reg.uci.edu/perl/WebSoc',

	departments: {
		element: 'select',
		name: 'Dept'
	},

	formdata: function(yearTerm) {
    return {
  		Submit: 'Display Web Results',
  		YearTerm: yearTerm,
  		ShowComments: 'on',
  		ShowFinals: 'on',
  		Breadth: 'ANY',
  		Dept: 'AFAM',
  		CourseNum: '',
  		Division: 'ANY',
  		CourseCodes: '',
  		InstrName: '',
  		CourseTitle: '',
  		ClassType: 'ALL',
  		Units: '',
  		Days: '',
  		StartTime: '',
  		EndTime: '',
  		MaxCap: '',
  		FullCourses: 'ANY',
  		FontSize: '100',
  		CancelledCourses: 'Exclude',
  		Bldg: '',
  		Room: ''
    };
	},


  sectionOffsets: {
    code: undefined,
    type: undefined,
    sec: undefined,
    units: undefined,
    instructor: undefined,
    time: undefined,
    place: undefined,
    final: undefined,
    max: undefined,
    enr: undefined,
    wl: undefined,
    req: undefined,
    nor: undefined,
    rstr: undefined,
    textbooks: undefined,
    web: undefined,
    status: undefined
  },

  quarters: {
    W14: '2014-03'
  }
}
