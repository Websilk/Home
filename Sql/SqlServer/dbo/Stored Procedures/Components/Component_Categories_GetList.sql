-- =============================================
-- Author:		Mark Entingh
-- Create date: 7/29/2015 7:30 PM
-- Description:	Get a list of component categories 
-- the user has access to for a given website
-- =============================================
CREATE PROCEDURE [dbo].Component_Categories_GetList
	@websiteId int = 0,
	@ownerId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT * FROM (
		SELECT DISTINCT a.title, a.name, a.description, a.applicationid
		FROM applicationsowned o 
		LEFT JOIN applications a 
		ON a.applicationid=o.applicationid 
		WHERE o.websiteid=@websiteId
	) AS tbl ORDER BY title ASC
END
