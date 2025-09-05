import { getNavigationGroups } from "../navigation";
import type { OnePage } from "@/shared/types/auth";

describe("Navigation", () => {
  describe("getNavigationGroups", () => {
    it("should generate navigation groups with onePages integration", () => {
      const onePages: OnePage[] = [
        {
          id: "1",
          Title: "Partners",
          slug: "partners",
        },
        {
          id: "2",
          Title: "About Us",
          slug: "about-us",
        },
      ];

      const result = getNavigationGroups(onePages);

      // Should return an array of navigation groups
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Each group should have items
      result.forEach((group) => {
        expect(group).toHaveProperty("items");
        expect(Array.isArray(group.items)).toBe(true);
      });

      // Should include standard navigation items
      const allItems = result.flatMap((group) => group.items);
      const itemLabels = allItems.map((item: any) => item.label);

      expect(itemLabels).toContain("Dashboard");
      expect(itemLabels).toContain("Branding");
      expect(itemLabels).toContain("Marketing");
    });

    it("should handle empty onePages array", () => {
      const result = getNavigationGroups([]);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Should still have the standard navigation items
      const allItems = result.flatMap((group) => group.items);
      const itemLabels = allItems.map((item: any) => item.label);
      expect(itemLabels).toContain("Dashboard");
    });

    it("should handle undefined onePages", () => {
      const result = getNavigationGroups(undefined);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should have consistent navigation structure", () => {
      const result = getNavigationGroups();

      // Verify structure of navigation items
      result.forEach((group) => {
        expect(group).toHaveProperty("items");

        group.items.forEach((item: any) => {
          expect(item).toHaveProperty("id");
          expect(item).toHaveProperty("label");
          expect(item).toHaveProperty("href");
          expect(typeof item.id).toBe("string");
          expect(typeof item.label).toBe("string");
          expect(typeof item.href).toBe("string");

          // Items with children should have valid children structure
          if (item.children) {
            expect(Array.isArray(item.children)).toBe(true);
            item.children.forEach((child: any) => {
              expect(child).toHaveProperty("id");
              expect(child).toHaveProperty("label");
              expect(child).toHaveProperty("href");
            });
          }
        });
      });
    });

    it("should have external link markers for external URLs", () => {
      const result = getNavigationGroups();
      const allItems = result.flatMap((group) => group.items);

      // Find external items
      const externalItems = allItems.filter(
        (item: any) => item.external === true
      );

      externalItems.forEach((item: any) => {
        // External items should have URLs that don't start with /
        expect(item.href).toMatch(/^https?:\/\//);
      });
    });

    it("should include all required navigation sections", () => {
      const result = getNavigationGroups();
      const allItems = result.flatMap((group) => group.items);
      const itemLabels = allItems.map((item: any) => item.label);

      // Check for key navigation items that should always be present
      const requiredSections = [
        "Dashboard",
        "Branding",
        "Marketing",
        "Company Calendar",
        "Company Directory",
        "Indi App",
      ];

      requiredSections.forEach((section) => {
        expect(itemLabels).toContain(section);
      });
    });

    it("should have proper icon components", () => {
      const result = getNavigationGroups();
      const allItems = result.flatMap((group) => group.items);

      allItems.forEach((item: any) => {
        if (item.icon) {
          // Icon should be a React component (function) or a valid React element
          // In test environment, Lucide icons might be imported as objects
          expect(
            typeof item.icon === "function" ||
              (typeof item.icon === "object" && item.icon !== null)
          ).toBe(true);
        }
      });
    });
  });
});
