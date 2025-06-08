"use client";

import { useEffect } from "react";
import Typed from "typed.js";
import styles from "./styles.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Portfolio() {
  useEffect(() => {
    const typed = new Typed(`.${styles.text}`, {
      strings: ["Programming", "Python Development", "Web Development"],
      typeSpeed: 100,
      backSpeed: 100,
      backDelay: 1000,
      loop: true,
    });

    const toTop = document.querySelector(`.${styles.top}`);
    const handleScroll = () => {
      if (window.pageYOffset > 100) {
        toTop?.classList.add(styles.active);
      } else {
        toTop?.classList.remove(styles.active);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      typed.destroy();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={styles.body}>
      <header className={styles.header}>
        <Link href="#" className={styles.logo}>
          CoderAbhishek
        </Link>
        <nav className={styles.navbar}>
          <Link
            href="#Home"
            style={{ "--i": 1 } as React.CSSProperties}
            className={styles.active}
          >
            Home
          </Link>
          <Link href="#About" style={{ "--i": 2 } as React.CSSProperties}>
            About
          </Link>
          <Link href="#Skills" style={{ "--i": 3 } as React.CSSProperties}>
            Skills
          </Link>
          <Link href="#Projects" style={{ "--i": 4 } as React.CSSProperties}>
            Projects
          </Link>
          <Link href="#Contact" style={{ "--i": 5 } as React.CSSProperties}>
            Contact
          </Link>
        </nav>
      </header>

      <section className={styles.home} id="Home">
        <div className={styles.homeContent}>
          <h3>Hello, I am</h3>
          <h1>ABHISHEK TIWARI</h1>
          <h4 style={{ "--i": 6 } as React.CSSProperties}>
            I'm a student who is
            <br />
            passionate in <span className={styles.text}></span>
          </h4>
          <div className={styles.img}>
            <Image
              src="/image.jpg.png"
              alt="Profile"
              className={styles.responsive}
              width={300}
              height={300}
            />
          </div>
          <div className={styles.homeSci}>
            <Link
              href="https://www.linkedin.com/in/abhishek-tiwari1132"
              style={{ "--i": 7 } as React.CSSProperties}
              target="_blank"
            >
              <i className="bx bxl-linkedin"></i>
            </Link>
            <Link
              href="https://www.instagram.com/arpit_tiwari_1103"
              style={{ "--i": 8 } as React.CSSProperties}
              target="_blank"
            >
              <i className="bx bxl-instagram"></i>
            </Link>
            <Link
              href="https://whatsapp.com/channel/0029VaAVs5pL7UVZAfiXWu1a"
              style={{ "--i": 9 } as React.CSSProperties}
              target="_blank"
            >
              <i className="bx bxl-whatsapp"></i>
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=100009643326579"
              style={{ "--i": 10 } as React.CSSProperties}
              target="_blank"
            >
              <i className="bx bxl-facebook"></i>
            </Link>
          </div>
          <Link
            href="https://drive.google.com/file/d/1ff0iQOH0BQU3K1KrsZahw7qNPOR-sQiB/view?usp=sharing"
            style={{ "--i": 11 } as React.CSSProperties}
            className={styles.btnBox}
            target="_blank"
          >
            Download Resume
          </Link>
        </div>
      </section>

      <section>
        <div className={styles.about} id="About">
          <div className={styles.aboutImg}>
            <Image
              src="/img.jpg"
              alt="About"
              className={styles.abtRes}
              width={492}
              height={492}
            />
          </div>
          <div className={styles.aboutText}>
            <h2>
              About <span>Me</span>
            </h2>
            <p>
              <b>
                Software Developer | Web & Mobile App Development | Backend &
                Database Expert
              </b>
              <br /> I am a skilled Software Developer at GTPL, contributing to web and mobile applications since December 2024. My expertise includes JavaScript, React JS, Next JS, and React Native for dynamic front-end development, alongside strong back-end skills in Python and Django. I have hands-on experience with SQL and PostgreSQL, using PGAdmin for efficient database management. Passionate about developing scalable, high-performance applications, I thrive on problem-solving and continuously enhancing my technical skills. Let's connect to discuss innovative solutions and opportunities in software development!
              <br />
              <br />
              <Link
                href="https://drive.google.com/file/d/1ff0iQOH0BQU3K1KrsZahw7qNPOR-sQiB/view?usp=sharing"
                style={{ "--i": 11 } as React.CSSProperties}
                className={styles.abtbtnBox}
                target="_blank"
              >
                Download Resume
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section id="Skills" className={styles.skills}>
        <h1 className={styles.subtitle}>
          My <span>Skills</span>
        </h1>
        <div className={styles.sec}>
          <div className={styles.container1}>
            <h1 className={styles.heading1}>Technical Skills</h1>
            <div className={styles.technicalBars}>
              <div className={styles.bar}>
                <i
                  className="bx bxl-javascript"
                  style={{ color: "#b0bc1e" }}
                ></i>
                <div className={styles.info}>
                  <span>
                    JavaScript <span className={styles.addpy}></span>
                  </span>
                </div>
                <div className={`${styles.progressLine} ${styles.javascript}`}>
                  <span></span>
                </div>
              </div>
              <div className={styles.bar}>
                <i className="bx bxl-react" style={{ color: "#3db2fc" }}></i>
                <div className={styles.info}>
                  <span>
                    ReactJs <span className={styles.addc}></span>
                  </span>
                </div>
                <div className={`${styles.progressLine} ${styles.react}`}>
                  <span></span>
                </div>
              </div>
              <div className={styles.bar}>
                <i className="bx bxl-react" style={{ color: "#000000" }}></i>
                <div className={styles.info}>
                  <span>
                    NextJs <span className={styles.addnextjs}></span>
                  </span>
                </div>
                <div className={`${styles.progressLine} ${styles.nextjs}`}>
                  <span></span>
                </div>
              </div>
              <div className={styles.bar}>
                <i className="bx bxl-python" style={{ color: "#3776ab" }}></i>
                <div className={styles.info}>
                  <span>
                    Python <span className={styles.addpython}></span>
                  </span>
                </div>
                <div className={`${styles.progressLine} ${styles.python}`}>
                  <span></span>
                </div>
              </div>
              <div className={styles.bar}>
                <i className="bx bxl-django" style={{ color: "#092e20" }}></i>
                <div className={styles.info}>
                  <span>
                    Django <span className={styles.adddjango}></span>
                  </span>
                </div>
                <div className={`${styles.progressLine} ${styles.django}`}>
                  <span></span>
                </div>
              </div>
              <div className={styles.bar}>
                <i className="bx bxl-postgresql" style={{ color: "#336791" }}></i>
                <div className={styles.info}>
                  <span>
                    PostgreSQL <span className={styles.addpostgresql}></span>
                  </span>
                </div>
                <div className={`${styles.progressLine} ${styles.postgresql}`}>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.container2}>
            <h1 className={styles.heading1}>Professional Skills</h1>
            <div className={styles.radialBars}>
              <div className={styles.radialBar}>
                <svg x="0px" y="0px" viewBox="0 0 200 200">
                  <circle
                    className={styles.progressBar}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                  <circle
                    className={`${styles.path} ${styles.path1}`}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                </svg>
                <div className={styles.percentage}>60%</div>
                <div className={styles.text}>Problem Solving</div>
              </div>
              <div className={styles.radialBar}>
                <svg x="0px" y="0px" viewBox="0 0 200 200">
                  <circle
                    className={styles.progressBar}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                  <circle
                    className={`${styles.path} ${styles.path2}`}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                </svg>
                <div className={styles.percentage}>70%</div>
                <div className={styles.text}>Creativity</div>
              </div>
              <div className={styles.radialBar}>
                <svg x="0px" y="0px" viewBox="0 0 200 200">
                  <circle
                    className={styles.progressBar}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                  <circle
                    className={`${styles.path} ${styles.path3}`}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                </svg>
                <div className={styles.percentage}>80%</div>
                <div className={styles.text}>Communication</div>
              </div>
              <div className={styles.radialBar}>
                <svg x="0px" y="0px" viewBox="0 0 200 200">
                  <circle
                    className={styles.progressBar}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                  <circle
                    className={`${styles.path} ${styles.path4}`}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                </svg>
                <div className={styles.percentage}>90%</div>
                <div className={styles.text}>Teamwork</div>
              </div>
              <div className={styles.radialBar}>
                <svg x="0px" y="0px" viewBox="0 0 200 200">
                  <circle
                    className={styles.progressBar}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                  <circle
                    className={`${styles.path} ${styles.path5}`}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                </svg>
                <div className={styles.percentage}>85%</div>
                <div className={styles.text}>Adaptability</div>
              </div>
              <div className={styles.radialBar}>
                <svg x="0px" y="0px" viewBox="0 0 200 200">
                  <circle
                    className={styles.progressBar}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                  <circle
                    className={`${styles.path} ${styles.path6}`}
                    cx="100"
                    cy="80"
                    r="80"
                  ></circle>
                </svg>
                <div className={styles.percentage}>75%</div>
                <div className={styles.text}>Leadership</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="Projects" className={styles.projects}>
        <div className={styles.services}>
          <div className={styles.mainText}>
            <h2>
              My <span>Projects</span>
            </h2>
            <div className={styles.servContainer}>
              <div className={styles.row}>
                <Image
                  src="/intern.JPEG"
                  alt="Software Development Internship at GTPL"
                  width={300}
                  height={300}
                />
                <div className={styles.layer}>
                  <h5>Internship at GTPL</h5>
                  <p>
                    A system where seekers request documents from owners, and verifiers validate those documents before providing them to the seekers.
                  </p>
                  <Link href="#" target="_blank">
                    <i
                      className="bx bxs-low-vision"
                      style={{ color: "aliceblue" }}
                    ></i>
                  </Link>
                </div>
              </div>
              <div className={styles.row}>
                <Image
                  src="/DD.png"
                  alt="Drowsiness Detection"
                  width={300}
                  height={300}
                />
                <div className={styles.layer}>
                  <h5>Drowsiness Detection</h5>
                  <p>
                    The driver drowsiness detection system is designed to
                    monitor a driver state and provide timely warnings if signs
                    of drowsiness are detected.
                  </p>
                  <Link href="#">
                    <i
                      className="bx bxs-low-vision"
                      style={{ color: "aliceblue" }}
                    ></i>
                  </Link>
                </div>
              </div>
              <div className={styles.row}>
                <Image
                  src="/lis.jpg"
                  alt="To-Do-List"
                  width={300}
                  height={300}
                />
                <div className={styles.layer}>
                  <h5>To-Do-List</h5>
                  <p>
                    Incorporated React.js to develop a dynamic to-do list in my
                    resume, allowing seamless task management.
                  </p>
                  <Link href="#">
                    <i
                      className="bx bxs-low-vision"
                      style={{ color: "aliceblue" }}
                    ></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="Services" className={styles.servicesSection}>
        <div className={styles.project}>
          <div className={styles.container}>
            <h1 className={styles.subTitle}>
              My <span>Services</span>
            </h1>
            <div className={styles.prjList}>
              <div>
                <i className="bx bx-code" style={{ color: "#e8e81f" }}></i>
                <h2>Web Development</h2>
                <p>
                  Plan, create and code internet sites and web pages with modern
                  and artful design.
                </p>
              </div>
              <div>
                <i className="bx bx-cube" style={{ color: "#e8e81f" }}></i>
                <h2>UI / UX Design</h2>
                <p>
                  Specialized in creating clean, artful design that are both
                  intuitive and functional.
                </p>
              </div>
              <div>
                <i className="bx bxl-android" style={{ color: "#e8e81f" }}></i>
                <h2>Software Development</h2>
                <p>Mobile application developer with knowledge of Java.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contacts} id="Contact">
        <div className={styles.contactText}>
          <h2>
            Contact <span>Me</span>
          </h2>
          <h4>Let's Work Together</h4>
          <div className={styles.contactList}>
            <li>
              <i className="bx bxs-send"></i>abhishekt1132000@gmail.com
            </li>
            <li>
              <i className="bx bxs-phone-call"></i>7054252971
            </li>
          </div>
          <div className={styles.contactIcons}>
            <Link
              href="https://www.facebook.com/profile.php?id=100009643326579"
              target="_blank"
            >
              <i className="bx bxl-facebook"></i>
            </Link>
            <Link
              href="https://whatsapp.com/channel/0029VaAVs5pL7UVZAfiXWu1a"
              target="_blank"
            >
              <i className="bx bxl-whatsapp"></i>
            </Link>
            <Link
              href="https://www.instagram.com/arpit_tiwari_1103"
              target="_blank"
            >
              <i className="bx bxl-instagram"></i>
            </Link>
            <Link
              href="https://www.linkedin.com/in/abhishek-tiwari1132"
              target="_blank"
            >
              <i className="bx bxl-linkedin"></i>
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.lastText}>
        <p>
          Developed by Abhishek{" "}
          <i className="bx bx-copyright" style={{ color: "white" }}></i> 2024
        </p>
      </div>
      <Link href="#Home" className={styles.top}>
        <i className="bx bx-up-arrow-alt"></i>
      </Link>
    </div>
  );
}