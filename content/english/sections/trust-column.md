---
# Trust column, rendered next to the get-started chooser and the Pro flow.
enable: true

proof:
  title: "Running where it counts"
  quote: "Decathlon processes 50 million scans a day on JobRunr"
  link:
    label: "Read the Decathlon case"
    url: "/en/use-case/jobrunr-pro-decathlon/"

stats:
  title: "Used by Java teams everywhere"
  list:
    - item: "300,000 downloads per month"
    # Both claims are already made publicly on the finance and insurance pages.
    - item: "Penetration tested by an outside party, every year"
    # `page` rather than `url`: the CRA page is still draft: true, so it does not exist in a
    # production build. The partial links the item only once that page actually publishes.
    - item: "CRA and DORA ready"
      page: "/pages/cyber-resilience-act"

quote:
  title: "What people say"
  content: "I love JobRunr. Love it, love it, love it."
  author: "Josh Long"
  designation: "Spring Developer Advocate"
  link:
    label: "Watch the video"
    url: "https://www.youtube.com/watch?v=KHTdPEYAMOM"

# don't create a separate page
build:
  render: "never"
---
