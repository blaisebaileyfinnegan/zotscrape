module.exports = {
	url: 'http://websoc.reg.uci.edu/perl/WebSoc',
	
	departments: {
		element: 'select',
		name: 'Dept'
	},
	
	formdata: {
		Submit: 'Display Web Results',
		YearTerm: '2013-92',
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
	},

    sectionOffsets: {
        code: 0,
        type: 1,
        section: 2,
        units: 3,
        instructor: 4,
        time: 5,
        place: 6,
        coursefinal: 7,
        max: 8,
        enrolled: 9,
        waitlisted: 10,
        req: 11,
        nor: 12,
        restrictions: 13,
        textbooks: 14,
        web: 15,
        status: 16
    },

    quarters: {
        F13: "2013-92",
        S13: "2013-14"
    }
}
