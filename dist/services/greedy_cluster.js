"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clusterPoints = exports.calculateDistance = exports.rawDataPoints = void 0;
// Static data points
exports.rawDataPoints = [
    { latitude: 17.3616, longitude: 78.4747, weight: 3 },
    { latitude: 17.4245, longitude: 78.4577, weight: 3 },
    { latitude: 17.4420, longitude: 78.3840, weight: 2 },
    { latitude: 17.4422, longitude: 78.3966, weight: 1 },
    { latitude: 17.4484, longitude: 78.3967, weight: 1 },
];
// Helper function to calculate the distance between two points
const calculateDistance = (point1, point2) => {
    const lat1 = point1.latitude;
    const lon1 = point1.longitude;
    const lat2 = point2.latitude;
    const lon2 = point2.longitude;
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};
exports.calculateDistance = calculateDistance;
// Greedy clustering algorithm
const clusterPoints = (points, distanceThreshold) => {
    const clusteredPoints = [];
    const visited = new Set();
    points.forEach((point, index) => {
        if (visited.has(index))
            return;
        let cluster = {
            latitude: point.latitude,
            longitude: point.longitude,
            weight: point.weight,
            count: 1,
        };
        visited.add(index);
        points.forEach((otherPoint, otherIndex) => {
            if (index !== otherIndex && !visited.has(otherIndex)) {
                const distance = (0, exports.calculateDistance)(point, otherPoint);
                if (distance < distanceThreshold) {
                    // Combine points into cluster
                    cluster.latitude =
                        (cluster.latitude * cluster.count + otherPoint.latitude) / (cluster.count + 1);
                    cluster.longitude =
                        (cluster.longitude * cluster.count + otherPoint.longitude) / (cluster.count + 1);
                    cluster.weight += otherPoint.weight;
                    cluster.count += 1;
                    visited.add(otherIndex);
                }
            }
        });
        clusteredPoints.push({
            latitude: cluster.latitude,
            longitude: cluster.longitude,
            weight: cluster.weight / cluster.count, // Average weight
        });
    });
    return clusteredPoints;
};
exports.clusterPoints = clusterPoints;
