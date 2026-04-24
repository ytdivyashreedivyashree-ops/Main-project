package com.example.student_portal_backend;

import java.util.List;
import java.util.Map;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.student_portal_backend.entity.CourseEntity;
import com.example.student_portal_backend.entity.SubjectEntity;
import com.example.student_portal_backend.repository.CourseRepo;
import com.example.student_portal_backend.repository.SubjectRepo;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CourseRepo courseRepo;
    private final SubjectRepo subjectRepo;

    public DataInitializer(CourseRepo courseRepo, SubjectRepo subjectRepo) {
        this.courseRepo = courseRepo;
        this.subjectRepo = subjectRepo;
    }

    @Override
    public void run(String... args) {
        seedCourses();
        seedSubjects();
        System.out.println("Courses and subjects seeded successfully.");
    }

    private void seedCourses() {
        List<String> names = List.of(
                "BCA", "BCOM", "BA", "BSC", "MCA", "MSC", "MCOM", "MA", "MBA", "MTECH");
        for (String name : names) {
            if (courseRepo.findByNameIgnoreCase(name).isEmpty()) {
                CourseEntity c = new CourseEntity();
                c.setName(name);
                courseRepo.save(c);
            }
        }
    }

    private void seedSubjects() {
        // course name → list of [subjectName, subjectCode]
        Map<String, List<String[]>> data = Map.of(
            "BCA", List.of(
                new String[]{"Programming in C", "BCA101"},
                new String[]{"Data Structures", "BCA102"},
                new String[]{"Java Programming", "BCA103"},
                new String[]{"Database Management System", "BCA104"},
                new String[]{"Operating System", "BCA105"},
                new String[]{"Computer Networks", "BCA106"},
                new String[]{"Software Engineering", "BCA107"},
                new String[]{"Web Development", "BCA108"},
                new String[]{"Artificial Intelligence", "BCA109"}
            ),
            "BCOM", List.of(
                new String[]{"Financial Accounting", "BCOM101"},
                new String[]{"Business Economics", "BCOM102"},
                new String[]{"Business Law", "BCOM103"},
                new String[]{"Corporate Accounting", "BCOM104"},
                new String[]{"Cost Accounting", "BCOM105"},
                new String[]{"Income Tax", "BCOM106"},
                new String[]{"Auditing", "BCOM107"},
                new String[]{"Marketing Management", "BCOM108"}
            ),
            "BA", List.of(
                new String[]{"English Literature", "BA101"},
                new String[]{"Political Science", "BA102"},
                new String[]{"History", "BA103"},
                new String[]{"Sociology", "BA104"},
                new String[]{"Psychology", "BA105"},
                new String[]{"Public Administration", "BA106"},
                new String[]{"Economics", "BA107"},
                new String[]{"Geography", "BA108"}
            ),
            "BSC", List.of(
                new String[]{"Mathematics", "BSC101"},
                new String[]{"Physics", "BSC102"},
                new String[]{"Chemistry", "BSC103"},
                new String[]{"Biology", "BSC104"},
                new String[]{"Statistics", "BSC105"},
                new String[]{"Environmental Science", "BSC106"},
                new String[]{"Computer Science", "BSC107"},
                new String[]{"Biotechnology", "BSC108"}
            ),
            "MCA", List.of(
                new String[]{"Advanced Java", "MCA101"},
                new String[]{"Data Structures & Algorithms", "MCA102"},
                new String[]{"Cloud Computing", "MCA103"},
                new String[]{"Artificial Intelligence", "MCA104"},
                new String[]{"Machine Learning", "MCA105"},
                new String[]{"Big Data Analytics", "MCA106"},
                new String[]{"Cyber Security", "MCA107"},
                new String[]{"Software Project Management", "MCA108"}
            ),
            "MSC", List.of(
                new String[]{"Advanced Mathematics", "MSC101"},
                new String[]{"Quantum Physics", "MSC102"},
                new String[]{"Organic Chemistry", "MSC103"},
                new String[]{"Data Analytics", "MSC104"},
                new String[]{"Research Methodology", "MSC105"},
                new String[]{"Bioinformatics", "MSC106"},
                new String[]{"Statistical Methods", "MSC107"},
                new String[]{"Environmental Science", "MSC108"}
            ),
            "MCOM", List.of(
                new String[]{"Advanced Accounting", "MCOM101"},
                new String[]{"Financial Management", "MCOM102"},
                new String[]{"Business Analytics", "MCOM103"},
                new String[]{"International Business", "MCOM104"},
                new String[]{"Banking and Insurance", "MCOM105"},
                new String[]{"Taxation", "MCOM106"},
                new String[]{"Corporate Governance", "MCOM107"},
                new String[]{"E-Commerce", "MCOM108"}
            ),
            "MA", List.of(
                new String[]{"Advanced English Literature", "MA101"},
                new String[]{"Political Theory", "MA102"},
                new String[]{"Sociology of Development", "MA103"},
                new String[]{"Public Policy", "MA104"},
                new String[]{"History of Modern India", "MA105"},
                new String[]{"Media Studies", "MA106"},
                new String[]{"Psychology", "MA107"},
                new String[]{"Philosophy", "MA108"}
            ),
            "MBA", List.of(
                new String[]{"Marketing Management", "MBA101"},
                new String[]{"Financial Management", "MBA102"},
                new String[]{"Human Resource Management", "MBA103"},
                new String[]{"Operations Management", "MBA104"},
                new String[]{"Business Analytics", "MBA105"},
                new String[]{"Strategic Management", "MBA106"},
                new String[]{"Entrepreneurship", "MBA107"},
                new String[]{"Organizational Behavior", "MBA108"}
            ),
            "MTECH", List.of(
                new String[]{"Advanced Algorithms", "MTECH101"},
                new String[]{"Machine Learning", "MTECH102"},
                new String[]{"Data Science", "MTECH103"},
                new String[]{"Embedded Systems", "MTECH104"},
                new String[]{"VLSI Design", "MTECH105"},
                new String[]{"Cloud Computing", "MTECH106"},
                new String[]{"Cyber Security", "MTECH107"},
                new String[]{"Internet of Things", "MTECH108"}
            )
        );

        for (Map.Entry<String, List<String[]>> entry : data.entrySet()) {
            CourseEntity course = courseRepo.findByNameIgnoreCase(entry.getKey()).orElse(null);
            if (course == null) continue;

            for (String[] subjectData : entry.getValue()) {
                String name = subjectData[0];
                String code = subjectData[1];
                if (subjectRepo.findBySubjectCode(code).isEmpty()) {
                    SubjectEntity subject = new SubjectEntity();
                    subject.setSubjectName(name);
                    subject.setSubjectCode(code);
                    subject.setCourse(course);
                    subjectRepo.save(subject);
                }
            }
        }
    }
}
